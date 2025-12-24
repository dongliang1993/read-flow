# Job 队列系统

基于数据库的异步任务队列，用于处理耗时的后台任务。

## 架构概览

```
Hono API
  │
  │ enqueueJob()
  ▼
Job Table (PostgreSQL)
  │
  │ poll (每 5 秒)
  ▼
Job Runner (worker loop)
  │
  ├─ parseBookJob    解析书籍
  ├─ embedBookJob    向量嵌入
  └─ summarizeBookJob 生成摘要
```

## 目录结构

```
apps/server/src/jobs/
├── index.ts              # 统一导出 + initJobSystem
├── schema.ts             # jobs 表定义
├── types.ts              # Job 类型定义
├── queue.ts              # 队列操作
├── runner.ts             # Job 执行调度器
├── worker.ts             # Worker 循环
└── handlers/
    ├── index.ts          # 注册所有 handlers
    ├── parse-book.ts     # parseBookJob
    ├── embed-book.ts     # embedBookJob
    └── summarize-book.ts # summarizeBookJob
```

## 数据库表

```sql
CREATE TABLE "jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,           -- parseBook / embedBook / summarizeBook
  "status" text NOT NULL DEFAULT 'pending', -- pending / running / failed / done
  "payload" jsonb,                -- Job 参数
  "result" jsonb,                 -- 执行结果
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "run_at" timestamp with time zone NOT NULL DEFAULT now(),
  "locked_at" timestamp with time zone,
  "locked_by" text,
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
```

运行迁移：

```bash
cd apps/server
pnpm db:migrate
```

## API 使用

### 入队任务

```typescript
import { enqueueJob } from './jobs'

// 基本用法
const job = await enqueueJob({
  type: 'parseBook',
  payload: { bookId: 123, filePath: '/path/to/book.epub' },
})
console.log(job.id) // uuid

// 延迟执行
await enqueueJob({
  type: 'embedBook',
  payload: { bookId: 123 },
  runAt: new Date(Date.now() + 60000), // 1 分钟后执行
})

// 自定义重试次数
await enqueueJob({
  type: 'summarizeBook',
  payload: { bookId: 123 },
  maxAttempts: 5,
})
```

### 查询任务状态

```typescript
import { getJobStatus, getQueueStats } from './jobs'

// 获取单个任务状态
const job = await getJobStatus('job-uuid')
// job.status: 'pending' | 'running' | 'failed' | 'done'

// 获取队列统计
const stats = await getQueueStats()
// { pending: 5, running: 1, failed: 0, done: 10 }
```

### 手动操作

```typescript
import { completeJob, failJob, cleanupStaleLocks } from './jobs'

// 手动完成任务
await completeJob('job-uuid', { result: 'data' })

// 手动失败任务
await failJob('job-uuid', 'Error message')

// 清理过期锁（worker 崩溃后）
await cleanupStaleLocks(300000) // 5 分钟阈值
```

## Job Handler

### 定义 Handler

```typescript
import type { JobHandler } from '../types'

interface MyPayload {
  bookId: number
}

interface MyResult {
  success: boolean
}

export const myHandler: JobHandler<MyPayload, MyResult> = {
  type: 'myJobType', // 需要添加到 JobType 类型
  
  async handle(payload, job) {
    // payload: MyPayload
    // job: 完整的 Job 记录
    
    console.log(`Processing book ${payload.bookId}`)
    
    // 执行任务逻辑...
    
    return { success: true }
  },
}
```

### 注册 Handler

在 `handlers/index.ts` 中：

```typescript
import { registerHandler } from '../runner'
import { myHandler } from './my-handler'

export function registerAllHandlers(): void {
  registerHandler(myHandler)
  // ...其他 handlers
}
```

## Worker 配置

Worker 在服务启动时自动初始化（`index.ts`）：

```typescript
import { initJobSystem } from './jobs'

initJobSystem({
  pollInterval: 5000,  // 轮询间隔（毫秒）
  concurrency: 2,      // 并发数
  workerId: 'worker-1', // 可选，默认自动生成
})
```

### 手动控制 Worker

```typescript
import { startWorker, stopWorker, getWorkerState } from './jobs'

// 启动
startWorker({ pollInterval: 3000, concurrency: 4 })

// 停止（等待当前任务完成）
await stopWorker()

// 查看状态
const state = getWorkerState()
// { isRunning: true, activeJobs: 1, ... }
```

## 特性

### 乐观锁

使用 `lockedAt` + `lockedBy` 防止多个 Worker 重复处理同一任务：

```sql
SELECT * FROM jobs 
WHERE status = 'pending' AND run_at <= now() AND locked_at IS NULL
FOR UPDATE SKIP LOCKED
LIMIT 1
```

### 重试机制

- 任务失败时 `attempts++`
- 未超过 `maxAttempts` 则重新排队
- 默认 30 秒后重试（指数退避可自行实现）

### 延迟执行

通过 `runAt` 字段实现：

```typescript
await enqueueJob({
  type: 'parseBook',
  payload: { bookId: 123 },
  runAt: new Date('2024-12-25T00:00:00Z'),
})
```

### 优雅关闭

监听 `SIGTERM`/`SIGINT`，等待当前任务完成后退出：

```
[Worker] Received SIGTERM, initiating graceful shutdown...
[Worker] Waiting for 1 active jobs to complete...
[Worker] Worker worker-abc123 stopped
```

## Job 类型

| Type | Payload | 说明 |
|------|---------|------|
| `parseBook` | `{ bookId, filePath }` | 解析 EPUB 提取元数据 |
| `embedBook` | `{ bookId }` | 生成向量嵌入（占位） |
| `summarizeBook` | `{ bookId, chapterIndex? }` | 生成章节摘要（占位） |

## 日志示例

```
[Queue] Enqueued job abc-123 (type: parseBook)
[Worker] Starting worker worker-xyz
[Queue] Dequeued job abc-123 (type: parseBook) by worker-xyz
[Runner] Executing job abc-123 (type: parseBook)
[ParseBook] Parsing book 1 from /uploads/book.epub
[ParseBook] Book 1 parsed: My Book by Author, 15 chapters
[Runner] Job abc-123 completed in 1234ms
[Queue] Job abc-123 completed
```

