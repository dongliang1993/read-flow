/**
 * Job Queue System
 *
 * 提供基于数据库的异步任务队列功能
 */

// Schema & Types
export {
  jobs,
  type Job,
  type NewJob,
  type JobStatus,
  type JobType,
} from './schema'
export type {
  JobHandler,
  EnqueueJobOptions,
  WorkerOptions,
  JobExecutionResult,
  ParseBookPayload,
  ParseBookResult,
  EmbedBookPayload,
  EmbedBookResult,
  SummarizeBookPayload,
  SummarizeBookResult,
} from './types'

// Queue Operations
export {
  enqueueJob,
  dequeueJob,
  completeJob,
  failJob,
  getJobStatus,
  cleanupStaleLocks,
  getQueueStats,
} from './queue'

// Runner
export {
  registerHandler,
  getHandler,
  getRegisteredTypes,
  executeJob,
} from './runner'

// Worker
export { startWorker, stopWorker, getWorkerState } from './worker'

// Handlers
export { registerAllHandlers } from './handlers'

/**
 * 初始化 Job 系统
 * 注册所有 handlers 并启动 worker
 */
export function initJobSystem(options?: {
  pollInterval?: number
  concurrency?: number
  workerId?: string
}): void {
  // 注册所有 handlers
  const { registerAllHandlers } = require('./handlers')
  registerAllHandlers()

  // 启动 worker
  const { startWorker } = require('./worker')
  startWorker(options)
}
