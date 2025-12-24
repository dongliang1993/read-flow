import { randomUUID } from 'crypto'
import type { WorkerOptions } from './types'
import { dequeueJob, cleanupStaleLocks } from './queue'
import { executeJob } from './runner'

/**
 * Worker 状态
 */
interface WorkerState {
  isRunning: boolean
  workerId: string
  activeJobs: number
  pollInterval: number
  concurrency: number
  pollTimer: ReturnType<typeof setTimeout> | null
  cleanupTimer: ReturnType<typeof setInterval> | null
}

let workerState: WorkerState | null = null

/**
 * 获取当前 Worker 状态
 */
export function getWorkerState(): WorkerState | null {
  return workerState
}

/**
 * 启动 Worker
 */
export function startWorker(options: WorkerOptions = {}): void {
  if (workerState?.isRunning) {
    console.warn('[Worker] Worker is already running')
    return
  }

  const {
    pollInterval = 5000,
    concurrency = 1,
    workerId = `worker-${randomUUID().slice(0, 8)}`,
  } = options

  workerState = {
    isRunning: true,
    workerId,
    activeJobs: 0,
    pollInterval,
    concurrency,
    pollTimer: null,
    cleanupTimer: null,
  }

  console.log(`[Worker] Starting worker ${workerId}`)
  console.log(
    `[Worker] Poll interval: ${pollInterval}ms, Concurrency: ${concurrency}`
  )

  // 启动轮询循环
  poll()

  // 定期清理过期锁（每 5 分钟）
  workerState.cleanupTimer = setInterval(() => {
    cleanupStaleLocks().catch(console.error)
  }, 300000)

  // 注册优雅关闭处理
  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
}

/**
 * 轮询并处理任务
 */
async function poll(): Promise<void> {
  if (!workerState?.isRunning) {
    return
  }

  const { workerId, concurrency, activeJobs, pollInterval } = workerState

  // 计算可以接受的新任务数量
  const availableSlots = concurrency - activeJobs

  if (availableSlots > 0) {
    // 尝试获取任务
    for (let i = 0; i < availableSlots; i++) {
      const job = await dequeueJob(workerId)

      if (job) {
        workerState.activeJobs++

        // 异步执行任务
        executeJob(job)
          .catch(console.error)
          .finally(() => {
            if (workerState) {
              workerState.activeJobs--
            }
          })
      } else {
        // 队列为空，跳出循环
        break
      }
    }
  }

  // 安排下一次轮询
  if (workerState.isRunning) {
    workerState.pollTimer = setTimeout(poll, pollInterval)
  }
}

/**
 * 停止 Worker
 */
export async function stopWorker(): Promise<void> {
  if (!workerState) {
    return
  }

  console.log(`[Worker] Stopping worker ${workerState.workerId}...`)
  workerState.isRunning = false

  // 清除定时器
  if (workerState.pollTimer) {
    clearTimeout(workerState.pollTimer)
  }
  if (workerState.cleanupTimer) {
    clearInterval(workerState.cleanupTimer)
  }

  // 等待活跃任务完成
  const maxWaitTime = 30000 // 最多等待 30 秒
  const startTime = Date.now()

  while (workerState.activeJobs > 0) {
    if (Date.now() - startTime > maxWaitTime) {
      console.warn(
        `[Worker] Timeout waiting for ${workerState.activeJobs} active jobs`
      )
      break
    }
    console.log(
      `[Worker] Waiting for ${workerState.activeJobs} active jobs to complete...`
    )
    await sleep(1000)
  }

  console.log(`[Worker] Worker ${workerState.workerId} stopped`)
  workerState = null
}

/**
 * 优雅关闭处理
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`[Worker] Received ${signal}, initiating graceful shutdown...`)
  await stopWorker()
  process.exit(0)
}

/**
 * 辅助函数：等待指定毫秒
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
