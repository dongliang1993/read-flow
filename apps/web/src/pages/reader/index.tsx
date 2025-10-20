import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockBooks } from '../../data/books'
import { Button } from '../../components/ui/button'
import HeaderBar from './components/header-bar'
import SideChat from './components/side-chat'
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

  if (!book || !bookId) {
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
      <HeaderBar
        book={book}
        fontSize={fontSize}
        decreaseFontSize={decreaseFontSize}
        increaseFontSize={increaseFontSize}
      />

      <div className='flex h-screen bg-neutral-50 dark:bg-neutral-950 p-2'>
        <main className='flex-1 overflow-hidden'>
          <div className='h-full max-w-6xl'>
            <EpubReader
              url={epubUrl}
              fontSize={fontSize}
              onLocationChange={setLocation}
            />
          </div>
        </main>
        <SideChat bookId={bookId} minWidth={360} />
      </div>
    </div>
  )
}
