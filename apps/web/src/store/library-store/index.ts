import { create } from 'zustand'
import type { Book } from '@read-flow/shared'

import { booksApi } from '@/service/books'
import { queryClient } from '@/lib/query-client'

type LibraryStore = {
  books: Book[]
  isLoading: boolean
  error: string | null

  setBooks: (books: Book[]) => void
  setIsLoading: (isLoading: boolean) => void
  addBook: (book: Book) => void // 新增
  refreshBooks: () => Promise<void>
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  books: [],
  isLoading: false,
  error: null,

  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  setBooks: (books) => set({ books }),
  setIsLoading: (isLoading) => set({ isLoading }),
  refreshBooks: async () => {
    try {
      set({ isLoading: true })
      const books = await queryClient.fetchQuery({
        queryKey: ['books'],
        queryFn: async () => {
          const { books } = await booksApi.getAll()
          return books
        },
      })

      set({ books })
    } catch (error) {
      console.error('Error refreshing books:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
