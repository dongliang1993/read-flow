import HeaderBar from './header-bar'
import { ReadContent } from './read-content'
import { FooterBar } from './foot-bar'
import { Annotator } from './annotator'
import { useProgressAutoSave } from '../hooks/use-progress-auto-save'
import { useReadingSession } from '../hooks/use-reading-session'

type ReaderProps = {
  bookId: string
}

export function Reader({ bookId }: ReaderProps) {
  useProgressAutoSave(bookId)
  const {} = useReadingSession(bookId, {
    onSession: (session, sessionStats) => {
      console.log('Session:', session, sessionStats)
    },
  })

  return (
    <div
      id={`reader-${bookId}`}
      className='flex flex-col h-full w-full bg-shade-01'
    >
      <HeaderBar />
      <ReadContent />
      <FooterBar />
      <Annotator />
    </div>
  )
}
