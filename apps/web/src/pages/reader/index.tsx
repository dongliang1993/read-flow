import { Resizable } from 're-resizable'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Reader } from './components/reader'
import { SideChat } from './components/side-chat'

const DEFAULT_SIZE = {
  width: 370,
  height: '100%',
}

export const ReaderLayout = () => {
  const [isChatVisible, setIsChatVisible] = useState(true)
  const [showOverlay, setShowOverlay] = useState(false)
  const { bookId } = useParams<{ bookId: string }>()

  if (!bookId) {
    return null
  }

  const chatSidebar = isChatVisible && (
    <Resizable
      defaultSize={DEFAULT_SIZE}
      className='h-full'
      minWidth={320}
      maxWidth={580}
      enable={{
        right: true,
        top: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
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
        right: (
          <div className='custom-resize-handle custom-resize-handle-left' />
        ),
      }}
    >
      <SideChat bookId={bookId} />
    </Resizable>
  )

  return (
    <div className='flex h-full w-full p-2'>
      <div className='relative flex-1 rounded-md border shadow-around overflow-hidden'>
        <Reader bookId={bookId} />

        {/* 遮罩层 */}
        {showOverlay && (
          <div className='absolute inset-0 z-50 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm dark:bg-neutral-900/60' />
        )}
      </div>
      {chatSidebar}
    </div>
  )
}
