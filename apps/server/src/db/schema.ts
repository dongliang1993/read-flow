import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core'
import type {
  Book,
  NewBook,
  ReadingProgress,
  NewReadingProgress,
  ChatMessage,
  NewChatMessage,
  Annotation,
  NewAnnotation,
} from '@read-flow/types'

// Re-export jobs schema
export { jobs, type Job, type NewJob, type JobStatus, type JobType } from '../jobs/schema'

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  coverUrl: text('cover_url'),
  filePath: text('file_path'),
  fileSize: integer('file_size'),
  status: text('status').default('unread'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  format: text('format').notNull(),
  language: text('language'),
  coverPath: text('cover_path'),
})

export const readingProgress = pgTable('reading_progress', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(),
  currentLocation: text('current_location'),
  progressCurrent: integer('progress_current').default(0),
  progressTotal: integer('progress_total').default(0),
  status: text('status').default('unread'),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
})

export const chatHistory = pgTable('chat_history', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(),
  cfiRange: text('cfi_range').notNull(),
  highlightedText: text('highlighted_text'),
  note: text('note'),
  color: text('color').default('#ffeb3b'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const chapterSummaries = pgTable('chapter_summaries', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  chapterIndex: integer('chapter_index').notNull(),
  chapterHref: text('chapter_href').notNull(),
  chapterTitle: text('chapter_title'),
  contentHash: text('content_hash').notNull(),
  summaryType: text('summary_type').notNull().default('brief'),
  summaryContent: text('summary_content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const readingSessions = pgTable('reading_sessions', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull().default('default-user'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').notNull().default('default-user'),
  title: text('title').notNull(),
  author: text('author'),
  sourcePlain: text('source_plain').notNull(),
  sourceRaw: text('source_raw').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title'),
  href: text('href'),
  order: integer('order').notNull(),
  content: text('content'),
  htmlContent: text('html_content'),
  wordCount: integer('word_count'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type Chapter = typeof chapters.$inferSelect
export type NewChapter = typeof chapters.$inferInsert

export type {
  Book,
  NewBook,
  ReadingProgress,
  NewReadingProgress,
  ChatMessage,
  NewChatMessage,
  Annotation,
  NewAnnotation,
}
