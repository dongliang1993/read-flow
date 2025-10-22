import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'

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
})

export const readingProgress = pgTable('reading_progress', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id)
    .notNull(),
  userId: text('user_id').notNull(),
  currentLocation: text('current_location'),
  progress: integer('progress').default(0),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
})

export const chatHistory = pgTable('chat_history', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id)
    .notNull(),
  userId: text('user_id').notNull(),
  cfiRange: text('cfi_range').notNull(),
  highlightedText: text('highlighted_text'),
  note: text('note'),
  color: text('color').default('#ffeb3b'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert
export type ReadingProgress = typeof readingProgress.$inferSelect
export type NewReadingProgress = typeof readingProgress.$inferInsert
export type ChatMessage = typeof chatHistory.$inferSelect
export type NewChatMessage = typeof chatHistory.$inferInsert
export type Annotation = typeof annotations.$inferSelect
export type NewAnnotation = typeof annotations.$inferInsert
