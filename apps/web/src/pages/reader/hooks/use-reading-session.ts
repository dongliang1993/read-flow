import { useEffect, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { noop, throttle } from 'lodash-es'
import { SessionState } from '@read-flow/shared'

import { env } from '@/config/env'
import { readingSessionService } from '@/service/reading-session'

import type { ReadingSession, SessionStats } from '@read-flow/shared'

type UseReadingSessionConfig = {
  saveInterval?: number
  onSession?: (session: ReadingSession, sessionStats: SessionStats) => void
}

const DEFAULT_SAVE_INTERVAL = 5 * 1000

export const useReadingSession = (
  bookId: string,
  config: UseReadingSessionConfig
) => {
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentSessionRef = useRef<ReadingSession | null>(null)
  const sessionStatsRef = useRef(sessionStats)

  const saveInterval = config.saveInterval || DEFAULT_SAVE_INTERVAL
  const onSession = config.onSession || noop

  // 处理用户活动
  const handleUserActivity = useMemoizedFn(() => {
    const now = Date.now()

    setSessionStats((prev) => {
      if (!prev) {
        return null
      }

      const timeDiff = now - prev.lastActivityTime
      let newTotalActiveTime = prev.totalActiveTime

      if (prev.currentState === SessionState.ACTIVE) {
        newTotalActiveTime += timeDiff
      }

      return {
        ...prev,
        totalActiveTime: newTotalActiveTime,
        lastActivityTime: now,
        currentState: SessionState.ACTIVE,
      }
    })
  })

  const handleWindowFocus = useMemoizedFn(() => {
    handleUserActivity()
  })

  const handleWindowBlur = useMemoizedFn(() => {
    setSessionStats((prev) => {
      if (!prev) return null
      const now = Date.now()
      const timeDiff = now - prev.lastActivityTime

      return {
        ...prev,
        totalActiveTime:
          prev.currentState === SessionState.ACTIVE
            ? prev.totalActiveTime + timeDiff
            : prev.totalActiveTime,
        lastActivityTime: now,
        currentState: SessionState.PAUSED,
      }
    })
  })

  const handleVisibilityChange = useMemoizedFn(() => {
    if (document.hidden) {
      handleWindowBlur()
    } else {
      handleUserActivity()
    }
  })

  const saveSessionData = useMemoizedFn(async () => {
    if (!bookId || !currentSessionRef.current || !sessionStats) {
      return
    }

    try {
      const totalSeconds = readingSessionService.calculateSessionDuration(
        currentSessionRef.current.startedAt,
        undefined,
        sessionStats.totalActiveTime
      )

      await readingSessionService.updateReadingSession(bookId, totalSeconds)

      console.log('saveSessionData success', bookId, totalSeconds)
    } catch (error) {
      console.error('Failed to save session data:', error)
    }
  })

  // 初始化阅读会话
  const initialize = useMemoizedFn(async () => {
    if (!bookId) {
      return
    }

    try {
      let session = await readingSessionService.getReadingSession(bookId)

      if (!session) {
        session = await readingSessionService.createReadingSession(
          bookId,
          Date.now()
        )
      }

      const sessionStats = {
        totalActiveTime: session.durationSeconds * 1000,
        sessionStartTime: session.startedAt,
        lastActivityTime: Date.now(),
        currentState: SessionState.ACTIVE,
      }

      currentSessionRef.current = session

      setSessionStats(sessionStats)
      setIsInitialized(true)
      onSession(session, sessionStats)
    } catch (error) {
      console.error('Failed to initialize reading session:', error)
    }
  })

  useEffect(() => {
    sessionStatsRef.current = sessionStats
  })

  useEffect(() => {
    if (!bookId) {
      return
    }

    initialize()

    return () => {}
  }, [bookId])

  useEffect(() => {
    if (!isInitialized || !bookId) {
      return
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)

    if (isInitialized) {
      saveIntervalRef.current = setInterval(saveSessionData, saveInterval)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)

      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
        saveIntervalRef.current = null
      }
    }
  }, [isInitialized, bookId, saveInterval])

  return {
    isInitialized,
    sessionStats,
    currentSession: currentSessionRef.current,
  }
}
