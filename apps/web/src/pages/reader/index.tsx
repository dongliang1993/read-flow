import { Resizable } from 're-resizable'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Reader } from './components/reader'
import { SideChat } from './components/side-chat'
import { useReaderStore } from '@/store/reader-store'

const DEFAULT_SIZE = {
  width: 370,
  height: '100%',
}

const RESIZE_ENABLE = {
  right: false,
  top: false,
  bottom: false,
  left: true,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
}

export const ReaderLayout = () => {
  const [isChatVisible, setIsChatVisible] = useState(true)
  const [showOverlay, setShowOverlay] = useState(false)
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

  const chatSidebar = isChatVisible && (
    <Resizable
      defaultSize={DEFAULT_SIZE}
      className='h-full'
      minWidth={320}
      maxWidth={540}
      enable={RESIZE_ENABLE}
      onResize={() => {
        if (!showOverlay) {
          setShowOverlay(true)
        }
      }}
      onResizeStop={() => {
        setShowOverlay(false)
        window.dispatchEvent(
          new CustomEvent('foliate-resize-update', {
            detail: { bookId, source: 'resize-drag' },
          })
        )
      }}
      handleComponent={{
        left: <div className='custom-resize-handle' />,
      }}
    >
      <SideChat bookId={bookData.id} />
    </Resizable>
  )

  return (
    <div className='flex h-full w-full p-2'>
      <div className='relative flex-1 rounded-md border shadow-around overflow-hidden'>
        <Reader bookId={bookData.id} />

        {/* 遮罩层 */}
        {showOverlay && (
          <div className='absolute inset-0 z-50 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm dark:bg-neutral-900/60' />
        )}
      </div>
      {chatSidebar}
    </div>
  )
}
