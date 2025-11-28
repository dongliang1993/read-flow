import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

import { useReaderStore } from '@/store/reader-store'
import { useFoliateViewer } from '@/service/foliate-viewer/use-foliate-viewer'

export const ReadContent = () => {
  const { bookId, bookData, config } = useReaderStore(
    useShallow((state) => ({
      bookData: state.bookData,
      bookId: state.activeBookId,
      config: state.config,
    }))
  )

  console.log('ReadContent', { bookData, bookId, config })

  const contentInsets = useMemo(() => {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  }, [])

  const foliateViewer = useFoliateViewer(
    bookId!,
    bookData?.bookDoc!,
    config!,
    contentInsets
  )

  if (!bookData) {
    return null
  }

  return <div ref={foliateViewer.containerRef} className='flex-1' />
}
