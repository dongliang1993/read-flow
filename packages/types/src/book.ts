export type BookStatus = 'reading' | 'finished' | 'unread'
export interface Book {
  id: number
  title: string
  author: string | null
  coverUrl: string | null
  filePath: string | null
  fileSize: number | null
  status: BookStatus
  createdAt: string
  updatedAt: string
  format: BookFormat
  language: string | null
  coverPath: string | null
}

export interface NewBook {
  title: string
  author?: string | null
  coverUrl?: string | null
  filePath?: string | null
  fileSize?: number | null
  status?: string
}

export interface ReadingProgress {
  id: number
  bookId: number
  userId: string
  currentLocation: string | null
  progress: number
  lastReadAt: string
}

export interface NewReadingProgress {
  bookId: number
  userId: string
  currentLocation?: string | null
  progress?: number
}

export type MessageContent =
  | string
  | Array<{ type: string; text?: string; image?: string }>

export interface ChatMessage {
  id: number
  bookId: number | null
  userId: string
  role: string
  content: MessageContent
  createdAt: string
}

export interface NewChatMessage {
  bookId?: number | null
  userId: string
  role: string
  content: MessageContent
}

export interface Annotation {
  id: number
  bookId: number
  userId: string
  cfiRange: string
  highlightedText: string | null
  note: string | null
  color: string
  createdAt: string
}

export interface NewAnnotation {
  bookId: number
  userId: string
  cfiRange: string
  highlightedText?: string | null
  note?: string | null
  color?: string
}

export type BookFormat = 'EPUB' | 'PDF' | 'MOBI' | 'AZW3' | 'AZW'
