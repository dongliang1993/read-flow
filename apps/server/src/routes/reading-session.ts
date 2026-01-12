import { Hono } from 'hono'
import type {
  ReadingSession,
  CreateReadingSessionRequest,
  UpdateReadingSessionRequest,
} from '@read-flow/shared'
import { eq, desc, and } from 'drizzle-orm'

import { db } from '../db'
import { readingSessions } from '../db/schema'
import type { auth } from '../lib/auth'

type Variables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const readingSessionRoute = new Hono<{ Variables: Variables }>()

/**
 * Get reading session
 * GET /api/v1/reading-session/:bookId
 */
readingSessionRoute.get('/:bookId', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = c.req.param('bookId')
    const [dbSession] = await db
      .select()
      .from(readingSessions)
      .where(
        and(
          eq(readingSessions.bookId, parseInt(bookId)),
          eq(readingSessions.userId, user.id)
        )
      )
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
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const body = await c.req.json<CreateReadingSessionRequest>()
    const bookId = c.req.param('bookId')
    const { startedAt } = body

    const [dbSession] = await db
      .insert(readingSessions)
      .values({
        bookId: parseInt(bookId),
        userId: user.id,
        startedAt: new Date(startedAt),
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
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const body = await c.req.json<UpdateReadingSessionRequest>()
    const bookId = c.req.param('bookId')
    const { durationSeconds } = body

    const [dbSession] = await db
      .update(readingSessions)
      .set({ durationSeconds })
      .where(
        and(
          eq(readingSessions.bookId, parseInt(bookId)),
          eq(readingSessions.userId, user.id)
        )
      )
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
