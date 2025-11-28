import type { BookFont, BookLayout } from '@/types/book'

export const DEFAULT_BOOK_FONT: BookFont = {
  defaultFontSize: 16,
  fontWeight: 400,
}

export const DEFAULT_BOOK_LAYOUT: BookLayout = {
  scrolled: true,
  writingMode: 'auto',
  vertical: false,
  continuousScroll: false,
}
