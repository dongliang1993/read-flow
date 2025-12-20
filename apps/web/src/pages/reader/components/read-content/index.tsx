import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

import { useReaderStore } from '@/store/reader-store'
import { useFoliateViewer } from '@/service/foliate-viewer/use-foliate-viewer'

export const ReadContent = () => {
  const { bookData, config } = useReaderStore(
    useShallow((state) => ({
      bookData: state.bookData,
      config: state.config,
    }))
  )

  const bookId = useMemo(() => bookData?.id, [bookData])

  const contentInsets = useMemo(() => {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  }, [])

  const foliateViewer = useFoliateViewer(
    bookData?.id!,
    bookData?.bookDoc!,
    config!,
    contentInsets
  )

  if (!bookData?.bookDoc || !config) {
    return null
  }

  return (
    <div
      ref={foliateViewer.containerRef}
      data-book-id={bookId}
      className='flex-1'
    />
  )
}
