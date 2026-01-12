import { Hono } from 'hono'
import { streamText, UIMessage, stepCountIs, convertToModelMessages } from 'ai'
import { eq, desc, and } from 'drizzle-orm'

import { convertHistoryToUIMessages } from '../lib/chat-transformer'
import { promptService } from '../services/prompt'
import { db } from '../db'
import { chatHistory } from '../db/schema'
import { providerService } from '../services/provider'
import { getAllToolsSync } from '../lib/ai/tools'
import { creditService } from '../services/credit-service'

import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { UpdateChatMessagesRequest } from '@read-flow/shared'
import type { auth } from '../lib/auth'

type Variables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const chat = new Hono<{ Variables: Variables }>()

async function saveUserMessage(
  bookId: number | null,
  userId: string,
  message: UIMessage
) {
  await db.insert(chatHistory).values({
    bookId,
    userId,
    role: message.role,
    content: message.parts,
  })
}

chat.get('/history/:bookId', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = parseInt(c.req.param('bookId'))
    const limit = parseInt(c.req.query('limit') || '50')

    const messages = await db
      .select()
      .from(chatHistory)
      .where(
        and(eq(chatHistory.bookId, bookId), eq(chatHistory.userId, user.id))
      )
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
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

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
      await saveUserMessage(validBookId, user.id, lastMessage)
    }

    // 2. 获取历史消息（用于发给 AI）
    const history = validBookId
      ? await db
          .select()
          .from(chatHistory)
          .where(
            and(
              eq(chatHistory.bookId, validBookId),
              eq(chatHistory.userId, user.id)
            )
          )
          .orderBy(chatHistory.createdAt)
          .limit(10)
      : []

    const modelMessages = convertHistoryToUIMessages(history)

    // 3. 构建 prompt 和调用 AI（provider 会从缓存中获取用户配置）
    const systemPrompt = await promptService.buildReadingPrompt(chatContext)
    const providerModel = await providerService.getProviderModel(model, user.id)

    // 获取模型定价（从用户配置缓存中获取）
    const modelPricing = await providerService.getModelPricing(model, user.id)
    if (!modelPricing) {
      console.warn('[Chat] No pricing found for model:', model)
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
      stopWhen: stepCountIs(30),
      tools: filteredTools,
      onFinish: async ({ usage }) => {
        console.log('[Chat] streamText usage:', usage)
        // 扣除积分
        if (modelPricing && usage) {
          const promptTokens =
            (usage as any).promptTokens || (usage as any).inputTokens || 0
          const completionTokens =
            (usage as any).completionTokens || (usage as any).outputTokens || 0

          if (promptTokens > 0 || completionTokens > 0) {
            const costCalc = creditService.calculateCost(
              promptTokens,
              completionTokens,
              modelPricing
            )

            console.log('[Chat] Usage:', {
              promptTokens,
              completionTokens,
              cost: costCalc,
            })

            const success = await creditService.deductCredits(
              user.id,
              costCalc.credits,
              {
                modelId: model,
                inputTokens: promptTokens,
                outputTokens: completionTokens,
                bookId: validBookId,
                costUSD: costCalc.totalCost,
              }
            )

            if (!success) {
              console.error('[Chat] Failed to deduct credits')
            }
          }
        }
      },
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ messages }) => {
        try {
          messages.forEach(async (message) => {
            await db.insert(chatHistory).values({
              bookId: validBookId,
              userId: user.id,
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
