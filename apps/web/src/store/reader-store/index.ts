import { create } from 'zustand'
import { queryClient } from '@/lib/query-client'

import { DocumentLoader } from '@/lib/document'
import { booksApi } from '@/service/books'

import type { Book } from '@read-flow/types'
import type { FoliateView } from '@/types/view'
import type { BookConfig } from '@/types/book'
import type { BookDoc } from '@/lib/document'

export type IBook = Book & {
  fileUrl: string
}

export type BookData = {
  id: string
  book: IBook | null
  file: File | null
  bookDoc: BookDoc | null
}

export type OpenDropdown = 'toc' | 'search' | 'settings' | null

type ReaderStore = {
  activeBookId: string | null
  activeBook: IBook | null
  bookData: BookData | null
  loading: boolean
  error: Error | null
  openDropdown: OpenDropdown | null
  view: FoliateView | null
  config: BookConfig | null

  setActiveBookId: (bookId: string) => void
  initBook: (bookId: string) => Promise<void>
  setOpenDropdown: (dropdown: OpenDropdown) => void
  setView: (view: FoliateView) => void
  setConfig: (config: BookConfig) => void
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

  initBook: async (bookId: string) => {
    try {
      set({ loading: true, error: null })
      const { setActiveBookId } = get()

      await setActiveBookId(bookId)

      const { activeBook } = get()
      const fileUrl = activeBook?.fileUrl || ''
      const response = await fetch(fileUrl)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch book file: ${response.status} ${response.statusText}`
        )
      }

      const arrayBuffer = await response.arrayBuffer()
      const filename =
        (activeBook?.title || '') + '.' + fileUrl?.split('.').pop()
      const file = new File([arrayBuffer], filename, {
        type: 'application/epub+zip',
      })

      const { book: bookDoc } = await new DocumentLoader(file).open()

      const bookData: BookData = {
        id: bookId,
        book: activeBook,
        file,
        bookDoc,
      }

      set({ loading: false, bookData })
    } catch (error) {
      console.error(`Failed to init book ${bookId}:`, error)
      set({ loading: false, error: error as Error })
    }
  },
  setView: (view: FoliateView) => set({ view }),
  setOpenDropdown: (dropdown) => set({ openDropdown: dropdown }),
  setConfig: (config) => set({ config }),
}))
