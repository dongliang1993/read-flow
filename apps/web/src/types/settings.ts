import type { BookFont, BookLayout, ViewConfig } from '@/types/book'

export type ReadSettings = {
  sideBarWidth: string
  isSideBarPinned: boolean
  notebookWidth: string
  isNotebookPinned: boolean
  autohideCursor: boolean
  translationProvider: string
  translateTargetLang: string
}

export type ViewSettings = BookFont & BookLayout & ViewConfig

export type SystemSettings = {
  globalViewSettings: ViewSettings
}
