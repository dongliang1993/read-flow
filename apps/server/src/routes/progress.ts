import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'

import { db } from '../db'
import { readingProgress, books } from '../db/schema'

import type {
  UpdateReadingProgressRequest,
  ReadingProgress,
  BookStatus,
} from '@read-flow/shared'
import type { auth } from '../lib/auth'

type Variables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const progressRoute = new Hono<{ Variables: Variables }>()

/**
 * Get book status
 * GET /api/v1/books/:id/status
 */
progressRoute.get('/:id/status', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = parseInt(c.req.param('id'))
    const [dbProgress] = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.bookId, bookId),
          eq(readingProgress.userId, user.id)
        )
      )
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
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = parseInt(c.req.param('id'))
    const body = await c.req.json<UpdateReadingProgressRequest>()
    const { status, progressCurrent, progressTotal, location, lastReadAt } =
      body

    // 先检查书籍是否存在
    const [book] = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)

    if (!book) {
      return c.json({ error: 'Book not found' }, 404)
    }

    const lastReadAtDate = lastReadAt ? new Date(lastReadAt) : new Date()

    // 先查后决定 insert/update
    const [existing] = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.bookId, bookId),
          eq(readingProgress.userId, user.id)
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
        .where(eq(readingProgress.id, existing.id))
        .returning()
    } else {
      // 创建阅读进度
      ;[progress] = await db
        .insert(readingProgress)
        .values({
          bookId,
          userId: user.id,
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
