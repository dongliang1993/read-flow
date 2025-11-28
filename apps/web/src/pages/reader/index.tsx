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

  const { initBook, loading, error, book } = useReaderStore(
    useShallow((state) => ({
      initBook: state.initBook,
      loading: state.loading,
      error: state.error,
      book: state.activeBook,
    }))
  )

  useEffect(() => {
    if (bookId) {
      initBook(bookId)
    }
  }, [bookId])

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
            <CardDescription>加载失败：{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <div className='flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950'>
      <HeaderBar />
      <ReadContent />
      <FooterBar />
    </div>
  )
}
