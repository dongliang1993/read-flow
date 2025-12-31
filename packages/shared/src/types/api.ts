import type { UIMessage } from 'ai'
import type { BookStatus } from './book'
import type { Note } from './note'

export type QuickPromptType =
  | 'summary'
  | 'analysis'
  | 'mindmap'
  | 'question'
  | 'note'

export type ChatContext = {
  quickPromptType?: QuickPromptType
  activeBookId: string
  sectionHref?: string
  sectionId?: number
  sectionLabel?: string
  sectionContent?: string
}

export interface UpdateChatMessagesRequest {
  messages: UIMessage[]
  bookId: string
  chatContext: ChatContext
  model: string
}

export interface CreateChapterSummaryRequest {
  bookId: string
  chapterIndex: number
  chapterHref: string
  chapterTitle: string
  content: string
  contentHash: string
  summaryType?: 'brief' | 'detailed'
}

export type ReadingSession = {
  id: number
  bookId: string
  startedAt: number
  endedAt?: number
  durationSeconds: number
  createdAt: number
  updatedAt: number
}

export type CreateReadingSessionRequest = {
  bookId: string
  startedAt: number
}

// 会话状态枚举
export enum SessionState {
  ACTIVE = 'active', // 正在阅读
  PAUSED = 'paused', // 暂停（失焦/长时间无活动）
  STOPPED = 'stopped', // 已结束
}

// 会话统计数据
export interface SessionStats {
  totalActiveTime: number // 总活跃时间（毫秒）
  sessionStartTime: number // 会话开始时间
  lastActivityTime: number // 最后活动时间
  currentState: SessionState // 当前状态
}

export interface UpdateReadingSessionRequest {
  durationSeconds: number
}

export type UpdateReadingProgressRequest = {
  userId: string
  status: BookStatus
  progressCurrent: number
  progressTotal: number
  location: string
  lastReadAt: number
}

export type CreateNoteRequest = {
  title: string
  author: string | null
  bookId?: string
  source: Note
}
