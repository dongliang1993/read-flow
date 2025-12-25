import type { Job, JobType, JobStatus } from './schema'

export type { Job, JobType, JobStatus }

/**
 * Job Handler 接口
 * 每种 Job 类型需要实现此接口
 */
export interface JobHandler<TPayload = unknown, TResult = unknown> {
  /** Job 类型标识 */
  type: JobType
  /** 处理函数 */
  handle: (payload: TPayload, job: Job) => Promise<TResult>
}

/**
 * 创建 Job 的参数
 */
export interface EnqueueJobOptions<TPayload = unknown> {
  type: JobType
  payload: TPayload
  /** 延迟执行时间，默认立即执行 */
  runAt?: Date
  /** 最大重试次数，默认 3 */
  maxAttempts?: number
}

/**
 * Worker 配置选项
 */
export interface WorkerOptions {
  /** 轮询间隔（毫秒），默认 5000 */
  pollInterval?: number
  /** 并发数，默认 1 */
  concurrency?: number
  /** Worker ID，用于 lockedBy，默认自动生成 */
  workerId?: string
}

/**
 * Job 执行结果
 */
export interface JobExecutionResult<TResult = unknown> {
  success: boolean
  result?: TResult
  error?: string
}

// ============ Job Payload 类型定义 ============

/**
 * parseBook Job 的 payload
 */
export interface ParseBookPayload {
  bookId: number
  filePath: string
}

/**
 * parseBook Job 的结果
 */
export interface ParseBookResult {
  title: string
  author?: string
  chaptersCount: number
}

/**
 * embedBook Job 的 payload
 */
export interface EmbedBookPayload {
  bookId: number
}

/**
 * embedBook Job 的结果
 */
export interface EmbedBookResult {
  chunksCount: number
  embeddingsCount: number
}

/**
 * summarizeBook Job 的 payload
 */
export interface SummarizeBookPayload {
  bookId: number
  chapterIndex?: number
}

/**
 * summarizeBook Job 的结果
 */
export interface SummarizeBookResult {
  summariesCount: number
}

