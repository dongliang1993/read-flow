import { useEffect } from 'react'
import { useMemoizedFn, useThrottleFn } from 'ahooks'

import { useReaderStore } from '@/store/reader-store'
import { booksApi } from '@/service/books'
import type { BookStatus } from '@read-flow/shared'

export const useProgressAutoSave = (bookId: string) => {
  const progress = useReaderStore((state) => state.progress)
  const location = useReaderStore((state) => state.location)

  console.log('progress', progress)
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
    } catch (error) {}
  })

  const { run: saveProgress } = useThrottleFn(updateBookProgress, {
    wait: 5000,
  })

  useEffect(() => {
    saveProgress()
  }, [progress, bookId, saveProgress])

  useEffect(() => {
    return () => {
      updateBookProgress()
    }
  }, [])
}
