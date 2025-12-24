import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Job 状态
 */
export type JobStatus = 'pending' | 'running' | 'failed' | 'done'

/**
 * Job 类型
 */
export type JobType = 'parseBook' | 'embedBook' | 'summarizeBook'

/**
 * Jobs 表定义
 */
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull().$type<JobType>(),
  status: text('status').notNull().default('pending').$type<JobStatus>(),
  payload: jsonb('payload'),
  result: jsonb('result'),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  runAt: timestamp('run_at', { withTimezone: true }).defaultNow().notNull(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  lockedBy: text('locked_by'),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

/**
 * Job 记录类型
 */
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert

