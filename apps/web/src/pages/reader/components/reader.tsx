import HeaderBar from './header-bar'
import { ReadContent } from './read-content'
import { FooterBar } from './foot-bar'

type ReaderProps = {
  bookId: string
}

export function Reader({ bookId }: ReaderProps) {
  return (
    <div
      id={`reader-${bookId}`}
      className='flex flex-col h-full w-full bg-background'
    >
      <HeaderBar />
      <ReadContent />
      <FooterBar />
    </div>
  )
}
