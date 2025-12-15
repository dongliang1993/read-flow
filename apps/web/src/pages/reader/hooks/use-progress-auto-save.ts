import { useEffect, useCallback } from 'react'
import { throttle } from 'lodash-es'
import { useMemoizedFn } from 'ahooks'

import { useReaderStore } from '@/store/reader-store'
import { booksApi } from '@/service/books'
import type { BookStatus } from '@read-flow/types'

export const useProgressAutoSave = (bookId: string) => {
  const progress = useReaderStore((state) => state.progress)
  const location = useReaderStore((state) => state.location)

  const updateBookProgress = useMemoizedFn(async () => {
    const currentProgress = progress
    if (!currentProgress || !currentProgress.pageInfo || !location) {
      return
    }

    try {
      const progressCurrent = currentProgress.pageInfo.current
      const progressTotal = currentProgress.pageInfo.total
      const now = Date.now()

      const currentStatus = await booksApi.getBookStatus(bookId)
      let newStatus: BookStatus = 'reading'

      if (progressCurrent >= progressTotal) {
        newStatus = 'finished'
      } else if (progressCurrent > 0) {
        newStatus = 'reading'
      }

      const updateData = {
        userId: 'default-user',
        status: newStatus,
        progressCurrent,
        progressTotal,
        location,
        lastReadAt: now,
      }

      if (!currentStatus?.startedAt && progressCurrent > 0) {
        updateData.startedAt = now
      }

      if (newStatus === 'finished' && !currentStatus?.completedAt) {
        updateData.completedAt = now
      }

      await booksApi.updateBookStatus(bookId, updateData)

      console.log('updateBookProgress')
    } catch (error) {}
  })

  const saveProgress = useCallback(throttle(updateBookProgress, 5000), [
    updateBookProgress,
  ])

  useEffect(() => {
    saveProgress()

    return () => {
      updateBookProgress()
    }
  }, [progress, bookId, saveProgress])
}
