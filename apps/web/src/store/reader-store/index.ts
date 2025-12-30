import { create } from 'zustand'
import { queryClient } from '@/lib/query-client'

import { DocumentLoader } from '@/lib/document'
import { booksApi, loadBookConfig } from '@/service/books'
import { useAppSettingsStore } from '@/store/app-settings-store'

import type { Book, ChatReference } from '@read-flow/shared'
import type { FoliateView } from '@/types/view'
import type { BookConfig, BookProgress } from '@/types/book'
import type { BookDoc } from '@/lib/document'
import type { TextSelection } from '@/utils/position'

export type BookData = {
  id: string
  book: Book | null
  file: File | null
  config: BookConfig | null
  bookDoc: BookDoc | null
}

export type OpenDropdown = 'toc' | 'search' | 'settings' | null

type ReaderStore = {
  activeBookId: string | null
  activeBook: Book | null
  bookData: BookData | null
  loading: boolean
  error: string | null
  openDropdown: OpenDropdown | null
  view: FoliateView | null
  config: BookConfig | null
  progress: BookProgress | null
  location: string | null
  selection: TextSelection | null
  references: ChatReference[]

  getBookById: (bookId: string) => Promise<Book | null>
  setActiveBookId: (bookId: string) => void
  initBook: (bookId: string) => Promise<void>
  setOpenDropdown: (dropdown: OpenDropdown) => void
  setView: (view: FoliateView) => void
  setConfig: (config: BookConfig) => void
  setProgress: (progress: BookProgress) => void
  setLocation: (location: string) => void
  setSelection: (selection: TextSelection | null) => void
  setReferences: (references: ChatReference[]) => void
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  activeBookId: null,
  activeBook: null,
  bookData: null,
  loading: false,
  error: null,
  openDropdown: null,
  view: null,
  config: null,
  progress: null,
  location: null,
  selection: null,
  references: [],

  setActiveBookId: async (bookId: string) => {
    const currentBookId = get().activeBookId

    if (bookId === currentBookId) {
      return
    }

    if (bookId) {
      try {
        const book = await queryClient.fetchQuery({
          queryKey: ['book', bookId],
          queryFn: async () => {
            const { book } = await booksApi.getById(Number(bookId))
            return book
          },
        })

        set({ activeBookId: bookId, activeBook: book })
      } catch (error) {
        console.error(`Failed to fetch book ${bookId}:`, error)
      }
    }
  },

  setProgress: (progress: BookProgress) => set({ progress }),
  setLocation: (location: string) => set({ location }),

  getBookById: async (bookId: string) => {
    try {
      const book = await queryClient.fetchQuery({
        queryKey: ['book', bookId],
        queryFn: async () => {
          const { book } = await booksApi.getById(Number(bookId))
          return book
        },
      })

      return book
    } catch (error) {
      console.error(`Failed to fetch book ${bookId}:`, error)
      return null
    }
  },

  initBook: async (bookId: string) => {
    try {
      set({ loading: true, error: null })

      const { settings } = useAppSettingsStore.getState()
      const { getBookById } = get()
      const book = await getBookById(bookId)

      if (!book) {
        throw new Error(`Book ${bookId} not found`)
      }

      if (!book.filePath) {
        throw new Error('Book file path is missing')
      }

      const fileUrl = book?.fileUrl
      const response = await fetch(fileUrl || '')

      if (!response.ok) {
        throw new Error(
          `Failed to fetch book file: ${response.status} ${response.statusText}`
        )
      }

      const arrayBuffer = await response.arrayBuffer()
      const filename = book.title + '.' + (fileUrl?.split('.').pop() || '')
      const file = new File([arrayBuffer], filename, {
        type: 'application/epub+zip',
      })

      const config = await loadBookConfig(bookId, settings)
      const { book: bookDoc } = await new DocumentLoader(file).open()

      const bookData: BookData = {
        id: bookId,
        book,
        file,
        config,
        bookDoc,
      }

      set({ loading: false, bookData, config })
    } catch (error) {
      console.error(`Failed to init book ${bookId}:`, error)
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
  setView: (view: FoliateView) => set({ view }),
  setOpenDropdown: (dropdown) => set({ openDropdown: dropdown }),
  setConfig: (config) => set({ config }),
  setSelection: (selection: TextSelection | null) => set({ selection }),
  setReferences: (references: ChatReference[]) => set({ references }),
}))
