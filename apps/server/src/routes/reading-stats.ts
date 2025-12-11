import { Hono } from 'hono'
import { db } from '../db'
import { readingSessions } from '../db/schema'
import { eq, sql, gte, and } from 'drizzle-orm'

const readingStatsRoute = new Hono()

/**
 * 获取阅读统计数据
 * GET /api/v1/reading-stats
 */
readingStatsRoute.get('/', async (c) => {
  try {
    const userId = 'default-user'
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // 获取总体统计数据
    const [stats] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalDuration: sql<number>`coalesce(sum(duration_seconds), 0)::int`,
        activeDays: sql<number>`count(distinct date(started_at))::int`,
      })
      .from(readingSessions)
      .where(eq(readingSessions.userId, userId))

    // 获取热力图数据（每天的阅读时长）
    const heatmapData = await db
      .select({
        date: sql<string>`to_char(started_at, 'YYYY-MM-DD')`,
        duration: sql<number>`sum(duration_seconds)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(readingSessions)
      .where(
        and(
          eq(readingSessions.userId, userId),
          gte(readingSessions.startedAt, oneYearAgo)
        )
      )
      .groupBy(sql`to_char(started_at, 'YYYY-MM-DD')`) // 改成一致的
    const totalSessions = stats?.totalSessions || 0
    const activeDays = stats?.activeDays || 0

    return c.json({
      stats: {
        totalSessions,
        totalDurationSeconds: stats?.totalDuration || 0,
        activeDays,
        avgSessionsPerDay:
          activeDays > 0 ? Number((totalSessions / activeDays).toFixed(1)) : 0,
      },
      heatmap: heatmapData,
    })
  } catch (error) {
    console.error('Get reading stats error:', error)
    return c.json({ error: 'Failed to fetch reading stats' }, 500)
  }
})

export default readingStatsRoute
