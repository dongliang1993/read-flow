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
  const [pageInfo, setPageInfo] = useState({
    current: 0,
    total: 0,
    chapterRemaining: 0,
  })

  useAsyncEffect(async () => {
    if (!viewerRef.current || !url) return

    setIsLoading(true)
    const book = Epub(url)
    bookRef.current = book

    console.log('Book is ready, generating locations...')

    // await book.locations.generate(1024)
    // console.log('Locations generated:', book.locations.total)

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

      // debugger
      // const currentPage = book.locations.locationFromCfi(locationString)
      // const totalPages = book.locations.total

      // const currentSpineIndex = location.start.index
      // const spine = book.spine.items
      // let chapterRemainingPages = 0

      // if (currentSpineIndex < spine.length - 1) {
      //   const nextChapterCfi = spine[currentSpineIndex + 1].cfi
      //   const nextChapterPage = book.locations.locationFromCfi(nextChapterCfi)
      //   chapterRemainingPages = nextChapterPage - currentPage
      // } else {
      //   chapterRemainingPages = totalPages - currentPage
      // }

      // setPageInfo({
      //   current: currentPage + 1,
      //   total: totalPages,
      //   chapterRemaining: Math.max(0, chapterRemainingPages),
      // })
    })

    await rendition.display()
    setIsLoading(false)
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
    <div className='relative flex flex-col group h-full'>
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
        style={{ width: '600px', height: '900px' }}
        // className='flex-1 bg-white dark:bg-neutral-900 rounded-lg shadow-inner overflow-hidden'
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

      {true && (
        <div className='absolute bottom-0 left-0 right-0 bg-neutral-100 dark:bg-neutral-800 py-2 px-4 text-center text-sm text-neutral-600 dark:text-neutral-400 rounded-b-lg'>
          <span>
            {pageInfo.current}/{pageInfo.total}页
          </span>
          {pageInfo.chapterRemaining > 0 && (
            <span className='ml-4'>本章还剩{pageInfo.chapterRemaining}页</span>
          )}
        </div>
      )}
    </div>
  )
}
