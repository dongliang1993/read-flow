import { Hono } from 'hono'
import { convertToModelMessages, streamText, UIMessage, ModelMessage } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { eq, desc } from 'drizzle-orm'

import {
  textToParts,
  convertHistoryToUIMessages,
} from '../lib/chat-transformer'
import type { UpdateChatMessagesRequest } from '@read-flow/types'

import { env } from '../config/env'
import { db } from '../db'
import { chatHistory } from '../db/schema'

const openai = createOpenAICompatible({
  apiKey: env.openai.apiKey,
  baseURL: env.openai.baseURL,
  includeUsage: true,
  name: 'OpenAI Compatible',
  headers: {
    Authorization: `Bearer ${env.openai.apiKey}`,
  },
})

const chat = new Hono()

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
    const { messages, bookId } = body

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Messages array is required' }, 400)
    }

    if (messages.length === 0) {
      return c.json({ error: 'At least one message is required' }, 400)
    }

    const validBookId = bookId ? parseInt(bookId) : null

    // 从数据库查询之前的消息历史
    let previousMessages: UIMessage[] = []
    if (validBookId) {
      const history = await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.bookId, validBookId))
        .orderBy(chatHistory.createdAt)
        .limit(20) // 限制历史消息数量，避免 token 超限

      previousMessages = convertHistoryToUIMessages(history)
    }

    const lastMessage = messages[messages.length - 1]
    const currentMessages: ModelMessage[] = convertToModelMessages(
      messages as unknown as UIMessage[]
    )

    if (lastMessage.parts) {
      await db.insert(chatHistory).values({
        bookId: bookId ? parseInt(bookId) : null,
        userId: 'default-user',
        role: lastMessage.role,
        content: lastMessage.parts,
      })
    }

    // 合并历史消息和当前消息
    const allMessages = [
      ...convertToModelMessages(previousMessages as unknown as UIMessage[]),
      ...currentMessages,
    ]

    const result = await streamText({
      model: openai(env.openai.model),
      system:
        'You are a helpful reading assistant for books. Help users understand and analyze the content they are reading.',
      messages: allMessages,
      providerOptions: {
        store: {
          store: false,
          include: ['reasoning.encrypted_content'],
        },
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
