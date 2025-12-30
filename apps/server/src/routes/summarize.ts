import { Hono } from 'hono'
import { streamText } from 'ai'
import { eq, and } from 'drizzle-orm'

import { db } from '../db'
import { chapterSummaries } from '../db/schema'
import { modelsService } from '../services/model-service'
import { SUMMARY_PROMPTS } from '../config/prompts'

import type { CreateChapterSummaryRequest } from '@read-flow/shared'

const summarize = new Hono()

summarize.get('/cache/:bookId/:chapterHref', async (c) => {
  try {
    const bookId = c.req.param('bookId')
    const chapterHref = decodeURIComponent(c.req.param('chapterHref'))

    const cached = await db
      .select()
      .from(chapterSummaries)
      .where(
        and(
          eq(chapterSummaries.bookId, parseInt(bookId)),
          eq(chapterSummaries.chapterHref, chapterHref)
        )
      )
      .limit(1)

    if (cached.length > 0) {
      return c.json({
        cached: true,
        summary: cached[0],
      })
    }

    return c.json({ cached: false, summary: null })
  } catch (error) {
    console.error('Get cache error:', error)
    return c.json({ error: 'Failed to get cache' }, 500)
  }
})

/**
 * 创建章节摘要
 * Post /api/v1/summarize
 * Body: CreateChapterSummaryRequest
 */
summarize.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateChapterSummaryRequest>()
    const {
      bookId,
      chapterIndex,
      chapterHref,
      chapterTitle,
      content,
      contentHash,
      summaryType = 'brief',
    } = body

    if (!content || !bookId) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const cached = await db
      .select()
      .from(chapterSummaries)
      .where(
        and(
          eq(chapterSummaries.bookId, parseInt(bookId)),
          eq(chapterSummaries.chapterHref, chapterHref),
          eq(chapterSummaries.contentHash, contentHash),
          eq(chapterSummaries.summaryType, summaryType)
        )
      )
      .limit(1)

    if (cached.length > 0) {
      return c.json({
        cached: true,
        summary: cached[0].summaryContent,
        summaryId: cached[0].id,
      })
    }

    const systemPrompt = SUMMARY_PROMPTS[summaryType]
    const userPrompt = chapterTitle
      ? `章节标题：${chapterTitle}\n\n章节内容：\n${content}`
      : `章节内容：\n${content}`

    const result = await streamText({
      model: modelsService.getModel('openai')('gpt-4'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      onFinish: async ({ text }) => {
        try {
          await db.insert(chapterSummaries).values({
            bookId: parseInt(bookId),
            chapterIndex,
            chapterHref,
            chapterTitle,
            contentHash,
            summaryType,
            summaryContent: text,
          })
          console.log('✅ Summary saved to database')
        } catch (error) {
          console.error('Failed to save summary:', error)
        }
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Summarize error:', error)
    return c.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

summarize.delete('/cache/:bookId', async (c) => {
  try {
    const bookId = c.req.param('bookId')

    await db
      .delete(chapterSummaries)
      .where(eq(chapterSummaries.bookId, parseInt(bookId)))

    return c.json({ success: true })
  } catch (error) {
    console.error('Delete cache error:', error)
    return c.json({ error: 'Failed to delete cache' }, 500)
  }
})

export default summarize
