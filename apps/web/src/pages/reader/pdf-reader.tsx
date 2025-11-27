import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '../../components/ui/button'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PdfReaderProps {
  pdfUrl: string
  initialPage?: number
  initialScale?: number
  onPageChange?: (page: number) => void
}

const MIN_SCALE = 0.5
const MAX_SCALE = 3.0
const SCALE_STEP = 0.25

export function PdfReader({
  pdfUrl,
  initialPage = 1,
  initialScale = 1.0,
  onPageChange,
}: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage)
  const [scale, setScale] = useState<number>(initialScale)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setIsLoading(false)
      setError(null)
    },
    []
  )

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(err)
    setIsLoading(false)
    console.error('PDF 加载失败:', err)
  }, [])

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => {
      const newPage = Math.max(prev - 1, 1)
      onPageChange?.(newPage)
      return newPage
    })
  }, [onPageChange])

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => {
      const newPage = Math.min(prev + 1, numPages)
      onPageChange?.(newPage)
      return newPage
    })
  }, [numPages, onPageChange])

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE))
  }, [])

  return (
    <div className='relative flex h-full flex-col'>
      <div className='flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            title='上一页'
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
          <span className='min-w-[100px] text-center text-sm text-neutral-700 dark:text-neutral-300'>
            {numPages > 0 ? `${pageNumber} / ${numPages}` : '-'}
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            title='下一页'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            title='缩小'
          >
            <ZoomOut className='h-5 w-5' />
          </Button>
          <span className='min-w-[60px] text-center text-sm text-neutral-700 dark:text-neutral-300'>
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            title='放大'
          >
            <ZoomIn className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950'>
        {isLoading && (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary' />
              <p className='text-neutral-600 dark:text-neutral-400'>
                正在加载 PDF...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center text-red-600 dark:text-red-400'>
              <p className='mb-2 text-lg font-medium'>加载失败</p>
              <p className='text-sm'>{error.message}</p>
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={null}
          className='flex justify-center py-4'
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className='shadow-lg'
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  )
}

