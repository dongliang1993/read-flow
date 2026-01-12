import { env } from '@/config/env'
import type { CreateChapterSummaryRequest } from '@read-flow/shared'

export interface CachedSummary {
  id: number
  bookId: number
  chapterIndex: number
  chapterHref: string
  chapterTitle: string | null
  contentHash: string
  summaryType: string
  summaryContent: string
  createdAt: string
}

export interface CacheResponse {
  cached: boolean
  summary: CachedSummary | null
}

class SummarizeService {
  async checkCache(
    bookId: string,
    chapterHref: string
  ): Promise<CacheResponse> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/summarize/cache/${bookId}/${encodeURIComponent(
        chapterHref
      )}`,
      {
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check cache')
    }

    return response.json()
  }

  async summarize(
    request: CreateChapterSummaryRequest,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to summarize')
    }

    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return data.summary
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let result = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      result += chunk

      if (onChunk) {
        onChunk(chunk)
      }
    }

    return result
  }

  async clearCache(bookId: string): Promise<void> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/summarize/cache/${bookId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to clear cache')
    }
  }
}

export const summarizeService = new SummarizeService()
