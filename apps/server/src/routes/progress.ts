import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'

import { db } from '../db'
import { readingProgress } from '../db/schema'

import type {
  UpdateReadingProgressRequest,
  ReadingProgress,
} from '@read-flow/types'

const progressRoute = new Hono()

/**
 * Get book status
 * GET /api/v1/books/:id/status
 */
progressRoute.get('/:id/status', async (c) => {
  try {
    const bookId = parseInt(c.req.param('id'))
    const [dbProgress] = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.bookId, bookId))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(1)

    const progress: ReadingProgress | null = dbProgress
      ? {
          id: dbProgress.id,
          bookId: dbProgress.bookId,
          userId: dbProgress.userId,
          currentLocation: dbProgress.currentLocation,
          progressCurrent: dbProgress.progressCurrent || 0,
          progressTotal: dbProgress.progressTotal || 0,
          status: (dbProgress.status as BookStatus) || 'unread',
          lastReadAt: dbProgress.lastReadAt.toISOString(),
        }
      : null

    return c.json({ progress })
  } catch (error) {
    console.error('Get book status error:', error)
    return c.json({ error: 'Failed to get book status' }, 500)
  }
})

/**
 * Update book progress
 * PUT /api/v1/books/:id/progress
 */
progressRoute.put('/:id/progress', async (c) => {
  try {
    const bookId = parseInt(c.req.param('id'))
    const body = await c.req.json<UpdateReadingProgressRequest>()
    const {
      userId,
      status,
      progressCurrent,
      progressTotal,
      location,
      lastReadAt,
    } = body

    const lastReadAtDate = lastReadAt ? new Date(lastReadAt) : new Date()
    // 更新/创建阅读进度

    // 方案 A: 先查后决定 insert/update
    const [existing] = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.bookId, bookId),
          eq(readingProgress.userId, userId)
        )
      )
      .limit(1)

    let progress

    if (existing) {
      // 更新阅读进度
      ;[progress] = await db
        .update(readingProgress)
        .set({
          currentLocation: location,
          progressCurrent,
          progressTotal,
          status,
          lastReadAt: lastReadAtDate,
        })
        .returning()
    } else {
      // 创建阅读进度
      ;[progress] = await db
        .insert(readingProgress)
        .values({
          bookId,
          userId,
          currentLocation: location,
          progressCurrent,
          progressTotal,
          status,
          lastReadAt: lastReadAtDate,
        })
        .returning()
    }

    return c.json({
      message: 'Book progress updated',
      progress: progress || null,
    })
  } catch (error) {
    console.error('Update book progress error:', error)
    return c.json({ error: 'Failed to update book progress' }, 500)
  }
})

export default progressRoute
