import { create } from 'zustand'
import type { Book } from '@read-flow/types'
import { queryClient } from '@/lib/query-client' // 你的 QueryClient 实例
import { booksApi } from '@/service/books'

export type IBook = Book & {
  fileUrl: string
}

export type BookData = {
  id: string
  book: IBook | null
  file: File | null
}

export type OpenDropdown = 'toc' | 'search' | 'settings' | null

type ReaderStore = {
  activeBookId: string | null
  activeBook: IBook | null
  bookData: BookData | null
  loading: boolean
  error: Error | null
  openDropdown: OpenDropdown | null

  setActiveBookId: (bookId: string) => void
  initBook: (bookId: string) => Promise<void>
  setOpenDropdown: (dropdown: OpenDropdown) => void
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  activeBookId: null,
  activeBook: null,
  bookData: null,
  loading: false,
  error: null,
  openDropdown: null,

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

      const bookData: BookData = {
        id: bookId,
        book: activeBook,
        file,
      }

      set({ loading: false, bookData })
    } catch (error) {
      console.error(`Failed to init book ${bookId}:`, error)
      set({ loading: false, error: error as Error })
    }
  },

  setOpenDropdown: (dropdown) => set({ openDropdown: dropdown }),
}))
