import { useEffect, useRef, useState } from 'react'
import Epub, { Book, Rendition } from 'epubjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAsyncEffect } from 'ahooks'
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
  const [isLoading, setIsLoading] = useState(false)

  useAsyncEffect(async () => {
    if (!viewerRef.current || !url) return

    const book = Epub(url)
    bookRef.current = book

    console.log('Book is ready, rendering...')

    const rendition = book.renderTo(viewerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'none',
    })

    renditionRef.current = rendition

    rendition.on('relocated', (location: any) => {
      console.log('📍 位置变化:', location)
      const locationString = location.start.cfi
      setCurrentLocation(locationString)
      onLocationChange?.(locationString)
    })

    await rendition.display()
  }, [url])

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
