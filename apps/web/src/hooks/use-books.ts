import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksApi } from '../service/books'
import type { Book } from '@read-flow/types'

export const BOOKS_QUERY_KEY = ['books']

export function useBooks() {
  return useQuery({
    queryKey: BOOKS_QUERY_KEY,
    queryFn: async () => {
      const data = await booksApi.getAll()
      console.log('data', data)
      return data.books
    },
  })
}

export function useBook(id: number) {
  return useQuery({
    queryKey: [...BOOKS_QUERY_KEY, id],
    queryFn: async () => {
      const data = await booksApi.getById(id)
      return data.book
    },
    enabled: !!id,
  })
}

export function useUploadBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      title,
      author,
    }: {
      file: File
      title: string
      author?: string
    }) => {
      return booksApi.upload(file, title, author)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return booksApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY })

      const previousBooks = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)

      if (previousBooks) {
        queryClient.setQueryData<Book[]>(
          BOOKS_QUERY_KEY,
          previousBooks.filter((book) => book.id !== deletedId)
        )
      }

      return { previousBooks }
    },
    onError: (err, deletedId, context) => {
      if (context?.previousBooks) {
        queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
      }
    },
  })
}

export function useDownloadBook() {
  return useMutation({
    mutationFn: async (id: number) => {
      const { downloadUrl } = await booksApi.getDownloadUrl(id)
      window.open(downloadUrl, '_blank')
    },
  })
}
