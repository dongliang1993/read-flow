import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import SettingsDropdown from './settings-dropdown'

import type { Book } from '@read-flow/types'

type HeaderBarProps = {
  book: Book
  fontSize: number
  decreaseFontSize: () => void
  increaseFontSize: () => void
}

const HeaderBar = ({
  book,
  fontSize,
  decreaseFontSize,
  increaseFontSize,
}: HeaderBarProps) => {
  const navigate = useNavigate()

  return (
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
          </Button>
        </div>
        <div className='flex-1'>
          <h1 className='text-sm font-medium text-neutral-900 dark:text-neutral-100 text-center'>
            {book.title}
          </h1>
        </div>
        <SettingsDropdown
          fontSize={fontSize}
          decreaseFontSize={decreaseFontSize}
          increaseFontSize={increaseFontSize}
        />
      </div>
    </header>
  )
}

export default HeaderBar
