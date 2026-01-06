import { Hono } from 'hono'
import { streamText, UIMessage, stepCountIs, convertToModelMessages } from 'ai'
import { eq, desc } from 'drizzle-orm'

import { convertHistoryToUIMessages } from '../lib/chat-transformer'
import { promptService } from '../services/prompt'
import { db } from '../db'
import { chatHistory } from '../db/schema'
import { providerService } from '../services/provider'
import { getAllToolsSync } from '../lib/ai/tools'

import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { UpdateChatMessagesRequest } from '@read-flow/shared'

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
    const { messages, bookId, chatContext, model } = body

    if (!model) {
      return c.json({ error: 'Model is required' }, 400)
    }

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

    const modelMessages = convertHistoryToUIMessages(history) //convertHistoryToModelMessages(history)
    // 3. 构建 prompt 和调用 AI
    const systemPrompt = await promptService.buildReadingPrompt(chatContext)
    const providerModel = providerService.getProviderModel(model)

    // Initialize agent loop state
    const loopState = {
      messages: [],
      currentIteration: 0,
      isComplete: false,
      lastFinishReason: undefined,
      lastRequestTokens: 0,
    }

    const filteredTools = { ...getAllToolsSync() }

    const result = await streamText({
      model: providerModel,
      system: systemPrompt,
      messages: await convertToModelMessages([...modelMessages, lastMessage]),
      toolChoice: 'auto',
      providerOptions: {
        openai: {
          store: false,
          include: ['reasoning.encrypted_content'],
        } satisfies OpenAIResponsesProviderOptions,
      },
      stopWhen: stepCountIs(5),
      tools: filteredTools,
      // experimental_transform: smoothStream({
      //   chunking: 'word',
      // }),
      // onFinish: async ({ text, finishReason, totalUsage, response }) => {
      //   if (totalUsage?.totalTokens) {
      //     loopState.lastRequestTokens = totalUsage.totalTokens
      //   }
      // },
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ messages }) => {
        try {
          messages.forEach(async (message) => {
            await db.insert(chatHistory).values({
              bookId: validBookId,
              userId: 'default-user',
              role: message.role,
              content: message.parts,
            })
          })
        } catch (error) {
          console.error('Failed to save AI response:', error)
        }
      },
    })
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
