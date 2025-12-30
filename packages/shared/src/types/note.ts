export type Note = {
  bookId?: string
  plain: string
  raw: string
}

export type ListNote = {
  id: number
  bookId: number | null
  title: string
  author: string | null
  sourcePlain: string
  sourceRaw: string
  createdAt: string
}
