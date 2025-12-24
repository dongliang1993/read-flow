import type { Job, JobType } from './schema'
import type { JobHandler, JobExecutionResult } from './types'
import { completeJob, failJob } from './queue'

/**
 * Job Handler 注册表
 */
const handlers = new Map<JobType, JobHandler>()

/**
 * 注册 Job Handler
 */
export function registerHandler<TPayload, TResult>(
  handler: JobHandler<TPayload, TResult>
): void {
  if (handlers.has(handler.type)) {
    console.warn(`[Runner] Handler for ${handler.type} is being overwritten`)
  }
  handlers.set(handler.type, handler as JobHandler)
  console.log(`[Runner] Registered handler for ${handler.type}`)
}

/**
 * 获取已注册的 Handler
 */
export function getHandler(type: JobType): JobHandler | undefined {
  return handlers.get(type)
}

/**
 * 获取所有已注册的 Handler 类型
 */
export function getRegisteredTypes(): JobType[] {
  return Array.from(handlers.keys())
}

/**
 * 执行单个 Job
 */
export async function executeJob(job: Job): Promise<JobExecutionResult> {
  const handler = handlers.get(job.type)

  if (!handler) {
    const error = `No handler registered for job type: ${job.type}`
    console.error(`[Runner] ${error}`)
    await failJob(job.id, error)
    return { success: false, error }
  }

  console.log(`[Runner] Executing job ${job.id} (type: ${job.type})`)
  const startTime = Date.now()

  try {
    const result = await handler.handle(job.payload, job)
    const duration = Date.now() - startTime

    await completeJob(job.id, result)
    console.log(`[Runner] Job ${job.id} completed in ${duration}ms`)

    return { success: true, result }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error(
      `[Runner] Job ${job.id} failed after ${duration}ms:`,
      errorMessage
    )
    await failJob(job.id, errorMessage)

    return { success: false, error: errorMessage }
  }
}

/**
 * 批量执行多个 Job（并发）
 */
export async function executeJobs(jobs: Job[]): Promise<JobExecutionResult[]> {
  return Promise.all(jobs.map(executeJob))
}
