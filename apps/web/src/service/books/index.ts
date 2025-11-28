import { env } from '../../config/env'
import type { Book } from '@read-flow/types'
import type { SystemSettings } from '@/types/settings'
import type { BookConfig } from '@/types/book'

export type BookInfoWithUrl = Book & {
  fileUrl: string
}

export interface BooksResponse {
  books: BookInfoWithUrl[]
}

export interface BookResponse {
  book: BookInfoWithUrl
}

export interface UploadBookResponse {
  book: Book
  fileUrl: string
}

export const booksApi = {
  async getAll(): Promise<BooksResponse> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/books`)
    if (!response.ok) {
      throw new Error('Failed to fetch books')
    }
    return response.json()
  },

  async getById(id: number): Promise<BookResponse> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/books/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch book')
    }
    return response.json()
  },

  async upload(
    file: File,
    title: string,
    author?: string
  ): Promise<UploadBookResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    if (author) {
      formData.append('author', author)
    }

    const response = await fetch(`${env.apiBaseUrl}/api/v1/books/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload book')
    }

    return response.json()
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/books/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete book')
    }
  },

  async downloadBook(id: number): Promise<ArrayBuffer> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/books/${id}/download`
    )

    console.log('response', `${env.apiBaseUrl}/api/v1/books/${id}/download`)
    if (!response.ok) {
      throw new Error('Failed to get download URL')
    }
    return response.arrayBuffer()
  },

  async getBookInfo(id: number): Promise<BookResponse> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/books/${id}`)
    if (!response.ok) {
      throw new Error('Failed to get book info')
    }

    return response.json()
  },
}

export async function loadBookConfig(
  bookId: string,
  settings: SystemSettings
): Promise<BookConfig> {
  const { globalViewSettings } = settings

  return {
    viewSettings: globalViewSettings,
  }
}
