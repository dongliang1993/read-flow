import { env } from '@/config/env'
import type { ReadingSession } from '@read-flow/shared'

export class ReadingSessionService {
  async getReadingSession(bookId: string) {
    try {
      const response = await fetch(
        `${env.apiBaseUrl}/api/v1/reading-session/${bookId}`
      )

      if (!response.ok) {
        throw new Error('Failed to get reading session')
      }

      const result = await response.json()

      return result.session as ReadingSession
    } catch (error) {
      console.error('Failed to get reading session:', error)
      throw error
    }
  }

  async createReadingSession(bookId: string, startedAt: number) {
    try {
      const response = await fetch(
        `${env.apiBaseUrl}/api/v1/reading-session/${bookId}`,
        {
          method: 'POST',
          body: JSON.stringify({ bookId, startedAt }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create reading session')
      }

      const result = await response.json()

      return result.session as ReadingSession
    } catch (error) {
      console.error('Failed to create reading session:', error)
      throw error
    }
  }

  async updateReadingSession(bookId: string, durationSeconds: number) {
    try {
      const response = await fetch(
        `${env.apiBaseUrl}/api/v1/reading-session/${bookId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ durationSeconds }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update reading session')
      }

      const result = await response.json()

      return result.session as ReadingSession
    } catch (error) {
      console.error('Failed to update reading session:', error)
      throw error
    }
  }

  /**
   * 计算会话的实际阅读时长（秒）
   */
  calculateSessionDuration(
    startedAt: number,
    endedAt?: number,
    totalActiveTimeMs?: number
  ): number {
    const endTime = endedAt || Date.now()
    const sessionDurationMs = totalActiveTimeMs || endTime - startedAt
    return Math.round(sessionDurationMs / 1000) // 转换为秒
  }
}

export const readingSessionService = new ReadingSessionService()
