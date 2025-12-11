import { Hono } from 'hono'
import type {
  ReadingSession,
  CreateReadingSessionRequest,
  UpdateReadingSessionRequest,
} from '@read-flow/types'
import { eq, desc } from 'drizzle-orm'

import { db } from '../db'
import { readingSessions } from '../db/schema'

const readingSessionRoute = new Hono()

/**
 * Get reading session
 * GET /api/v1/reading-session/:bookId
 */
readingSessionRoute.get('/:bookId', async (c) => {
  try {
    const bookId = c.req.param('bookId')
    const [dbSession] = await db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.bookId, parseInt(bookId)))
      .orderBy(desc(readingSessions.startedAt))
      .limit(1)

    const session: ReadingSession | null = dbSession
      ? {
          id: dbSession.id,
          bookId: dbSession.bookId.toString(),
          startedAt: dbSession.startedAt.getTime(),
          endedAt: dbSession.endedAt?.getTime(),
          durationSeconds: dbSession.durationSeconds,
          createdAt: dbSession.createdAt.getTime(),
          updatedAt: dbSession.updatedAt.getTime(),
        }
      : null

    return c.json({ session })
  } catch (error) {
    console.error('Get reading session error:', error)
    return c.json({ error: 'Failed to fetch reading session' }, 500)
  }
})

/**
 * Create reading session
 * POST /api/v1/reading-session
 * Body: CreateReadingSessionRequest
 */
readingSessionRoute.post('/:bookId', async (c) => {
  try {
    const body = await c.req.json<CreateReadingSessionRequest>()
    const bookId = c.req.param('bookId')
    const { startedAt } = body

    const [dbSession] = await db
      .insert(readingSessions)
      .values({
        bookId: parseInt(bookId),
        userId: 'default-user',
        startedAt: new Date(startedAt), // 时间戳转 Date
        durationSeconds: 0,
      })
      .returning()

    const session: ReadingSession | null = dbSession
      ? {
          id: dbSession.id,
          bookId: dbSession.bookId.toString(),
          startedAt: dbSession.startedAt.getTime(),
          endedAt: dbSession.endedAt?.getTime(),
          durationSeconds: dbSession.durationSeconds,
          createdAt: dbSession.createdAt.getTime(),
          updatedAt: dbSession.updatedAt.getTime(),
        }
      : null

    return c.json({ session })
  } catch (error) {
    console.error('Create reading session error:', error)
    return c.json({ error: 'Failed to create reading session' }, 500)
  }
})

/**
 * Update reading session
 * PUT /api/v1/reading-session/:bookId
 * Body: UpdateReadingSessionRequest
 */
readingSessionRoute.put('/:bookId', async (c) => {
  try {
    const body = await c.req.json<UpdateReadingSessionRequest>()
    const bookId = c.req.param('bookId')
    const { durationSeconds } = body

    const [dbSession] = await db
      .update(readingSessions)
      .set({ durationSeconds })
      .where(eq(readingSessions.bookId, parseInt(bookId)))
      .returning()

    const session: ReadingSession | null = dbSession
      ? {
          id: dbSession.id,
          bookId: dbSession.bookId.toString(),
          startedAt: dbSession.startedAt.getTime(),
          endedAt: dbSession.endedAt?.getTime(),
          durationSeconds: dbSession.durationSeconds,
          createdAt: dbSession.createdAt.getTime(),
          updatedAt: dbSession.updatedAt.getTime(),
        }
      : null

    return c.json({ session })
  } catch (error) {
    console.error('Update reading session error:', error)
    return c.json({ error: 'Failed to update reading session' }, 500)
  }
})

export default readingSessionRoute
