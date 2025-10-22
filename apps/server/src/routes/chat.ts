import { Hono } from 'hono'
import { convertToModelMessages, streamText, UIMessage, ModelMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { env } from '../config/env'
import { db } from '../db'
import { chatHistory, books } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

const openai = createOpenAI({
  apiKey: env.openai.apiKey,
  baseURL: env.openai.baseURL,
  headers: {
    Authorization: `Bearer ${env.openai.apiKey}`,
  },
})

const chat = new Hono()

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: UIMessage[]
  bookId?: string
  context?: string
  model?: string
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

    return c.json({ messages: messages.reverse() })
  } catch (error) {
    console.error('Get chat history error:', error)
    return c.json({ error: 'Failed to fetch chat history' }, 500)
  }
})

chat.post('/', async (c) => {
  try {
    const body: ChatRequest = await c.req.json()
    const { messages, bookId, context } = body

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Messages array is required' }, 400)
    }

    if (messages.length === 0) {
      return c.json({ error: 'At least one message is required' }, 400)
    }

    const modelMessages: ModelMessage[] = convertToModelMessages(
      messages as unknown as UIMessage[]
    )

    const lastMessage = modelMessages[modelMessages.length - 1]

    if (lastMessage.content) {
      await db.insert(chatHistory).values({
        bookId: bookId ? parseInt(bookId) : null,
        userId: 'default-user',
        role: lastMessage.role,
        content: lastMessage.content,
      })
    }

    const validBookId = bookId ? parseInt(bookId) : null

    const result = await streamText({
      model: openai(env.openai.model),
      system:
        'You are a helpful reading assistant for books. Help users understand and analyze the content they are reading.',
      messages: modelMessages,
      providerOptions: {
        store: {
          store: false,
          include: ['reasoning.encrypted_content'],
        },
      },
      onFinish: async ({ text, finishReason }) => {
        try {
          await db.insert(chatHistory).values({
            bookId: validBookId,
            userId: 'default-user',
            role: 'assistant',
            content: text,
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
