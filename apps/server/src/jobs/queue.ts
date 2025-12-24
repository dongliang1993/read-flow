import { eq, and, lte, isNull, sql } from 'drizzle-orm'
import { db } from '../db'
import { jobs, type Job, type JobStatus } from './schema'
import type { EnqueueJobOptions } from './types'

/**
 * 将任务加入队列
 */
export async function enqueueJob<TPayload>(
  options: EnqueueJobOptions<TPayload>
): Promise<Job> {
  const { type, payload, runAt = new Date(), maxAttempts = 3 } = options

  const [job] = await db
    .insert(jobs)
    .values({
      type,
      payload,
      runAt,
      maxAttempts,
      status: 'pending',
      attempts: 0,
    })
    .returning()

  console.log(`[Queue] Enqueued job ${job.id} (type: ${type})`)
  return job
}

/**
 * 从队列中获取并锁定一个待处理的任务
 * 使用乐观锁防止多个 worker 同时处理同一个任务
 */
export async function dequeueJob(workerId: string): Promise<Job | null> {
  const now = new Date()

  // 使用事务确保原子性
  const result = await db.transaction(async (tx) => {
    // 查找一个待处理的任务
    const [pendingJob] = await tx
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.status, 'pending'),
          lte(jobs.runAt, now),
          isNull(jobs.lockedAt)
        )
      )
      .limit(1)
      .for('update', { skipLocked: true })

    console.log('pendingJob', pendingJob)
    if (!pendingJob) {
      return null
    }

    // 锁定任务
    const [lockedJob] = await tx
      .update(jobs)
      .set({
        status: 'running',
        lockedAt: now,
        lockedBy: workerId,
        updatedAt: now,
      })
      .where(eq(jobs.id, pendingJob.id))
      .returning()

    return lockedJob
  })

  if (result) {
    console.log(
      `[Queue] Dequeued job ${result.id} (type: ${result.type}) by ${workerId}`
    )
  }

  return result
}

/**
 * 标记任务完成
 */
export async function completeJob<TResult>(
  jobId: string,
  result: TResult
): Promise<Job> {
  const now = new Date()

  const [job] = await db
    .update(jobs)
    .set({
      status: 'done',
      result,
      lockedAt: null,
      lockedBy: null,
      updatedAt: now,
    })
    .where(eq(jobs.id, jobId))
    .returning()

  console.log(`[Queue] Job ${jobId} completed`)
  return job
}

/**
 * 标记任务失败
 * 如果未超过最大重试次数，则重新排队
 */
export async function failJob(
  jobId: string,
  error: string,
  retryDelay = 30000 // 默认 30 秒后重试
): Promise<Job> {
  const now = new Date()

  // 先获取当前任务信息
  const [currentJob] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)

  if (!currentJob) {
    throw new Error(`Job ${jobId} not found`)
  }

  const newAttempts = currentJob.attempts + 1
  const shouldRetry = newAttempts < currentJob.maxAttempts

  const [job] = await db
    .update(jobs)
    .set({
      status: shouldRetry ? 'pending' : 'failed',
      attempts: newAttempts,
      error,
      lockedAt: null,
      lockedBy: null,
      runAt: shouldRetry
        ? new Date(now.getTime() + retryDelay)
        : currentJob.runAt,
      updatedAt: now,
    })
    .where(eq(jobs.id, jobId))
    .returning()

  if (shouldRetry) {
    console.log(
      `[Queue] Job ${jobId} failed (attempt ${newAttempts}/${currentJob.maxAttempts}), will retry`
    )
  } else {
    console.log(
      `[Queue] Job ${jobId} failed permanently after ${newAttempts} attempts`
    )
  }

  return job
}

/**
 * 获取任务状态
 */
export async function getJobStatus(jobId: string): Promise<Job | null> {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)

  return job || null
}

/**
 * 清理过期的锁定任务
 * 用于处理 worker 崩溃后遗留的锁定任务
 */
export async function cleanupStaleLocks(
  staleThresholdMs = 300000
): Promise<number> {
  const threshold = new Date(Date.now() - staleThresholdMs)

  const result = await db
    .update(jobs)
    .set({
      status: 'pending',
      lockedAt: null,
      lockedBy: null,
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.status, 'running'), lte(jobs.lockedAt, threshold)))
    .returning()

  if (result.length > 0) {
    console.log(`[Queue] Cleaned up ${result.length} stale locks`)
  }

  return result.length
}

/**
 * 获取队列统计信息
 */
export async function getQueueStats(): Promise<{
  pending: number
  running: number
  failed: number
  done: number
}> {
  const result = await db
    .select({
      status: jobs.status,
      count: sql<number>`count(*)::int`,
    })
    .from(jobs)
    .groupBy(jobs.status)

  const stats = {
    pending: 0,
    running: 0,
    failed: 0,
    done: 0,
  }

  for (const row of result) {
    if (row.status in stats) {
      stats[row.status as JobStatus] = row.count
    }
  }

  return stats
}
