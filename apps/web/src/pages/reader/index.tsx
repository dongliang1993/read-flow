import { Resizable } from 're-resizable'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { motion } from 'motion/react'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Studio } from './components/studio'
import { Reader } from './components/reader'
import { SideChat } from './components/side-chat'
import { Notes } from './components/notes'
import { Header } from './components/header'

import { useReaderStore } from '@/store/reader-store'

const DEFAULT_SIZE = {
  width: 450,
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

const ReaderContent = ({ bookId }: { bookId: string }) => {
  const [showOverlay, setShowOverlay] = useState(false)
  const [isChatVisible] = useState(true)

  const { initBook, loading, error, bookData } = useReaderStore(
    useShallow((state) => ({
      initBook: state.initBook,
      loading: state.loading,
      error: state.error,
      bookData: state.bookData,
    }))
  )

  useEffect(() => {
    if (bookId) {
      initBook(bookId)
    }
  }, [bookId])

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950 rounded-3xl'>
        <div className='text-neutral-500'>loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950 rounded-3xl'>
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
      minWidth={420}
      maxWidth={620}
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
      <Studio>
        {(tab) => {
          return tab === 'chat' ? (
            <SideChat bookId={bookData.id} />
          ) : (
            <Notes bookId={bookData.id} />
          )
        }}
      </Studio>
    </Resizable>
  )

  return (
    <>
      <div className='relative flex-1 rounded-3xl border shadow-around overflow-hidden'>
        {/* 阅读器 */}
        <Reader bookId={bookData.id} />

        {/* 遮罩层 */}
        {showOverlay && (
          <div className='absolute inset-0 z-50 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm dark:bg-neutral-900/60' />
        )}
      </div>
      {chatSidebar}
    </>
  )
}

export const ReaderLayout = () => {
  const { bookId = '' } = useParams<{ bookId: string }>()

  return (
    <div className='flex flex-col h-full w-full pt-0 bg-accent'>
      <Header />
      <motion.div
        layoutId={`book-card-${bookId}`}
        className='flex-1 flex min-h-0 p-2 pt-0'
      >
        <ReaderContent bookId={bookId} />
      </motion.div>
    </div>
  )
}
