import { env } from '@/config/env'
import { DocumentLoader } from '@/lib/document'

import type { Book, BookFormat } from '@read-flow/shared'

export * from './book-service'
import type { SystemSettings } from '@/types/settings'
import type { BookConfig } from '@/types/book'
import type {
  ReadingProgress,
  UpdateReadingProgressRequest,
} from '@read-flow/shared'
import type { Contributor } from '@/utils/book'

export interface BooksResponse {
  books: Book[]
}

export interface BookResponse {
  book: Book
}

export interface UploadBookResponse {
  book: Book
}

export const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase()
}

function getAuthor(author: string | Contributor): string {
  if (typeof author === 'string') {
    return author
  }

  return author.name
}

function getFileMimeType(fileName: string): string {
  const ext = getFileExtension(fileName)
  switch (ext) {
    case 'epub':
      return 'application/epub+zip'
    case 'pdf':
      return 'application/pdf'
    case 'mobi':
      return 'application/x-mobipocket-ebook'
    case 'cbz':
      return 'application/vnd.comicbook+zip'
    case 'fb2':
      return 'application/x-fictionbook+xml'
    case 'fbz':
      return 'application/x-zip-compressed-fb2'
    default:
      return 'application/octet-stream'
  }
}

export async function parseEpubFile(fileData: ArrayBuffer, fileName: string) {
  const file = new File([fileData], fileName, {
    type: getFileMimeType(fileName),
  })
  const loader = new DocumentLoader(file)
  const { book } = await loader.open()

  return book
}

function getBookFormat(fileName: string): BookFormat {
  const ext = getFileExtension(fileName)

  switch (ext) {
    case 'epub':
      return 'EPUB'
    case 'pdf':
      return 'PDF'
    case 'mobi':
      return 'MOBI'
    case 'azw3':
      return 'AZW3'
    default:
      return 'EPUB'
  }
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

  async uploadBook(file: File): Promise<UploadBookResponse> {
    const format: BookFormat = getBookFormat(file.name)

    if (!['EPUB', 'PDF', 'MOBI', 'AZW3', 'AZW'].includes(format)) {
      throw new Error(`不支持的文件格式: ${format}`)
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = file.name
    const coverFileName = `${timestamp}-${randomStr}-cover.jpg`
    const formData = new FormData()
    const fileData = await file.arrayBuffer()
    let author: string | Contributor = 'Unknown'
    let language: string | string[] = 'Unknown'
    let coverTempFile: File | null = null

    if (['EPUB', 'AZW3', 'AZW'].includes(format)) {
      try {
        // 需要提取出来封面，一起上传
        const bookDoc = await parseEpubFile(fileData, file.name)
        const coverBlob = await bookDoc.getCover()
        const coverArrayBuffer = (await coverBlob?.arrayBuffer()) || null
        author = getAuthor(bookDoc.metadata.author)
        language = bookDoc.metadata.language || 'Unknown'

        if (coverArrayBuffer) {
          coverTempFile = new File([coverArrayBuffer], coverFileName)
        }
      } catch (error) {
        console.error('Failed to parse epub file:', error)
      }
    }

    formData.append('file', file)
    formData.append('title', fileName)
    formData.append('format', format)
    formData.append('fileSize', file.size.toString())
    formData.append(
      'author',
      typeof author === 'string' ? author : JSON.stringify(author)
    )
    formData.append(
      'language',
      typeof language === 'string' ? language : JSON.stringify(language)
    )

    if (coverTempFile) {
      formData.append('cover', coverTempFile)
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

  async getBookStatus(id: string): Promise<ReadingProgress> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/progress/${id}/status`
    )

    if (!response.ok) {
      throw new Error('Failed to get book status')
    }

    const data = await response.json()
    return data.progress as ReadingProgress
  },

  async updateBookStatus(
    id: string,
    data: UpdateReadingProgressRequest
  ): Promise<void> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/progress/${id}/progress`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update book status')
    }

    return response.json()
  },
}

export async function loadBookConfig(
  bookId: string,
  settings: SystemSettings
): Promise<BookConfig> {
  const { globalViewSettings } = settings

  const bookStatus = await booksApi.getBookStatus(bookId)

  if (bookStatus) {
    return {
      progress: [bookStatus.progressCurrent, bookStatus.progressTotal],
      location: bookStatus.currentLocation || undefined,
      viewSettings: globalViewSettings,
      updatedAt: bookStatus.lastReadAt
        ? new Date(bookStatus.lastReadAt).getTime()
        : Date.now(),
    }
  }

  return {
    viewSettings: globalViewSettings,
  }
}
