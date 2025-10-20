import { Hono } from 'hono'
import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { env } from '../config/env'

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
  messages: ChatMessage[]
  bookId?: string
  context?: string
  model?: string
}

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

    const lastMessage = messages[messages.length - 1]

    console.log('Chat request:', {
      bookId,
      messageCount: messages.length,
      lastMessage: lastMessage.content,
      hasContext: !!context,
      env,
    })

    const result = await streamText({
      model: openai(env.openai.model),
      system:
        'You are a helpful reading assistant for books. Help users understand and analyze the content they are reading.',
      messages: convertToModelMessages(messages as unknown as UIMessage[]),
      providerOptions: {
        store: {
          store: false,
          include: ['reasoning.encrypted_content'],
        },
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
