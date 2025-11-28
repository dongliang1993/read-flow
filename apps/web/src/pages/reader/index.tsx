import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import HeaderBar from './components/header-bar'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { ReadContent } from './components/read-content'
import { FooterBar } from './components/foot-bar'
import { useReaderStore } from '@/store/reader-store'

export function Reader() {
  const { bookId } = useParams<{ bookId: string }>()

  const { initBook, loading, error, bookData } = useReaderStore(
    useShallow((state) => ({
      initBook: state.initBook,
      loading: state.loading,
      error: state.error,
      bookData: state.bookData,
    }))
  )

  useEffect(() => {
    if (bookId && !bookData) {
      initBook(bookId)
    }
  }, [bookId, bookData])

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-neutral-500'>loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardDescription>加载失败：{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!bookData) {
    return null
  }

  return (
    <div
      id={`reader-${bookData.id}`}
      className='flex flex-col h-full w-full bg-background'
    >
      <HeaderBar />
      <ReadContent />
      <FooterBar />
    </div>
  )
}
