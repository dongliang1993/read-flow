import { useEffect, useRef, useState } from 'react'
import ePub, { Book, Rendition } from 'epubjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'

interface EpubReaderProps {
  url: string
  fontSize: number
  onLocationChange?: (location: string) => void
}

export function EpubReader({
  url,
  fontSize,
  onLocationChange,
}: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!viewerRef.current || !url) return

    setIsLoading(true)

    // 通过 fetch 下载为 ArrayBuffer，然后传给 epub.js
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.arrayBuffer()
      })
      .then((arrayBuffer) => {
        console.log('📦 ArrayBuffer 大小:', arrayBuffer.byteLength)

        // 🧪 测试：可以切换这两种模式
        // 模式1：从服务器加载的 ArrayBuffer
        const book = ePub('/test.epub')

        // 模式2：从本地 public 目录加载（取消注释测试）
        // const book = ePub('/test.epub')

        console.log('📖 Book 对象创建:', book)
        bookRef.current = book

        const rendition = book.renderTo(viewerRef.current as HTMLElement, {
          width: '100%',
          height: '100%',
          spread: 'none',
        })
        console.log('🎨 Rendition 对象创建:', rendition)

        renditionRef.current = rendition

        rendition.on('relocated', (location: any) => {
          console.log('📍 位置变化:', location)
          const locationString = location.start.cfi
          setCurrentLocation(locationString)
          onLocationChange?.(locationString)
        })

        console.log('🎬 开始调用 display()')
        const displayPromise = rendition.display()
        console.log('🎬 display() 返回值:', displayPromise)
        return displayPromise
      })
      .then(() => {
        console.log('✅ EPUB 渲染成功!')
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load EPUB:', error)
        setIsLoading(false)
      })

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
      if (bookRef.current) {
        bookRef.current.destroy()
      }
    }
  }, [url, onLocationChange])

  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`)
    }
  }, [fontSize])

  const goToPrevPage = () => {
    renditionRef.current?.prev()
  }

  const goToNextPage = () => {
    renditionRef.current?.next()
  }

  return (
    <div className='relative h-full group'>
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 z-10'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
            <p className='text-neutral-600 dark:text-neutral-400'>
              正在加载书籍...
            </p>
          </div>
        </div>
      )}

      <div
        ref={viewerRef}
        className='h-full bg-white dark:bg-neutral-900 rounded-lg shadow-inner overflow-hidden'
      />

      <Button
        variant='ghost'
        size='icon'
        onClick={goToPrevPage}
        className='absolute left-4 top-1/2 -translate-y-1/2 h-16 w-6 rounded-lg bg-transparent hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity'
      >
        <ChevronLeft className='h-5 w-5' />
      </Button>

      <Button
        variant='ghost'
        size='icon'
        onClick={goToNextPage}
        className='absolute right-4 top-1/2 -translate-y-1/2 h-16 w-6 rounded-lg bg-transparent hover:bg-gray-200  opacity-0 group-hover:opacity-100 transition-opacity'
      >
        <ChevronRight className='h-5 w-5' />
      </Button>
    </div>
  )
}
