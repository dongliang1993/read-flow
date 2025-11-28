export type BookFont = {
  defaultFontSize: number
}

export type ReadSettings = {
  sideBarWidth: string
  isSideBarPinned: boolean
  notebookWidth: string
  isNotebookPinned: boolean
  autohideCursor: boolean
  translationProvider: string
  translateTargetLang: string
}

export type ViewSettings = BookFont

export type SystemSettings = {
  globalViewSettings: ViewSettings
}
