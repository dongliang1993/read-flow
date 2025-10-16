import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Minus, Plus } from 'lucide-react'
import { mockBooks } from '../../data/books'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { EpubReader } from './epub-reader'

export function Reader() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const [location, setLocation] = useState<string>('')
  const [fontSize, setFontSize] = useState(100)

  const book = mockBooks.find((b) => b.id === bookId)

  if (!book) {
    return (
      <div className='flex items-center justify-center min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle>书籍未找到</CardTitle>
            <CardDescription>
              抱歉，找不到 ID 为 {bookId} 的书籍
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/library/all')}>返回书库</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const epubUrl = 'https://s3.amazonaws.com/moby-dick/moby-dick.epub'

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 10, 200))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 10, 50))
  }

  return (
    <div className='flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950'>
      <header className='flex-shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4'>
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate(-1)}
              className='gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              返回
            </Button>
            <div className='h-6 w-px bg-neutral-200 dark:bg-neutral-800' />
            <div className='flex items-center gap-3'>
              <BookOpen className='h-5 w-5 text-neutral-500' />
              <div>
                <h1 className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                  {book.title}
                </h1>
                <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                  {book.author}
                </p>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg'>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={decreaseFontSize}
                disabled={fontSize <= 50}
              >
                <Minus className='h-3.5 w-3.5' />
              </Button>
              <span className='text-xs font-medium text-neutral-700 dark:text-neutral-300 min-w-10 text-center'>
                大
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={increaseFontSize}
                disabled={fontSize >= 200}
              >
                <Plus className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1 overflow-hidden p-6'>
        <div className='h-full max-w-6xl mx-auto'>
          <EpubReader
            url={epubUrl}
            fontSize={fontSize}
            onLocationChange={setLocation}
          />
        </div>
      </main>
    </div>
  )
}
