import { Hono } from 'hono'
import { streamText, UIMessage, stepCountIs, convertToModelMessages } from 'ai'
import { eq, desc } from 'drizzle-orm'

import {
  textToParts,
  convertHistoryToUIMessages,
  convertHistoryToModelMessages,
} from '../lib/chat-transformer'
import { promptService } from '../services/prompt'
import { db } from '../db'
import { chatHistory } from '../db/schema'
import { modelsService } from '../services/model-service'
import { createRagSearchTool } from '../lib/ai/tools/rag-search'

import type { UpdateChatMessagesRequest } from '@read-flow/types'

const chat = new Hono()

// 3. 新增：将 UIMessage 保存到数据库
export async function saveUserMessage(
  db: any,
  bookId: number | null,
  message: UIMessage
) {
  await db.insert(chatHistory).values({
    bookId,
    userId: 'default-user',
    role: message.role,
    content: message.parts, // parts 直接存储为 jsonb
  })
}

chat.get('/history/:bookId', async (c) => {
  try {
    const bookId = parseInt(c.req.param('bookId'))
    const limit = parseInt(c.req.query('limit') || '50')

    const messages = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.bookId, bookId))
      .orderBy(desc(chatHistory.createdAt))
      .limit(limit)

    return c.json({ messages: convertHistoryToUIMessages(messages).reverse() })
  } catch (error) {
    console.error('Get chat history error:', error)
    return c.json({ error: 'Failed to fetch chat history' }, 500)
  }
})

/**
 * 保存聊天记录
 * Post /api/v1/chat/messages
 * Body: UpdateChatMessagesRequest
 */
chat.post('/', async (c) => {
  try {
    const body = await c.req.json<UpdateChatMessagesRequest>()
    const { messages, bookId, chatContext } = body

    if (!messages?.length) {
      return c.json({ error: 'At least one message is required' }, 400)
    }

    const validBookId = bookId ? parseInt(bookId) : null
    const lastMessage = messages[messages.length - 1]

    // 1. 保存用户消息到数据库
    if (lastMessage.role === 'user' && lastMessage.parts) {
      await saveUserMessage(db, validBookId, lastMessage)
    }

    // 2. 获取历史消息（用于发给 AI）
    const history = validBookId
      ? await db
          .select()
          .from(chatHistory)
          .where(eq(chatHistory.bookId, validBookId))
          .orderBy(chatHistory.createdAt)
          .limit(10)
      : []

    const modelMessages = convertHistoryToModelMessages(history)
    // 3. 构建 prompt 和调用 AI
    const systemPrompt = await promptService.buildReadingPrompt(chatContext)

    const result = await streamText({
      model: modelsService.getModel('openai')('gpt-4'),
      system: systemPrompt,
      messages: convertToModelMessages([lastMessage]),
      toolChoice: 'auto',
      stopWhen: stepCountIs(2),
      tools: {
        ragSearch: createRagSearchTool(validBookId!),
      },
      providerOptions: {
        store: {
          store: false,
          include: ['reasoning.encrypted_content'],
        },
      },
      onStepFinish: ({ toolCalls, toolResults }) => {
        console.log(
          'Tool calls:',
          toolCalls?.length,
          'Results:',
          toolResults?.length
        )
      },
      onFinish: async ({ text }) => {
        try {
          await db.insert(chatHistory).values({
            bookId: validBookId,
            userId: 'default-user',
            role: 'assistant',
            content: textToParts(text),
          })
          console.log('✅ AI response saved to database')
        } catch (error) {
          console.error('Failed to save AI response:', error)
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return c.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default chat
