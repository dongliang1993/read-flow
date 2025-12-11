import type { UIMessage } from 'ai'

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
