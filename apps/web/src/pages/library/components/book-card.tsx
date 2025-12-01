import { useNavigate } from 'react-router-dom'
import { Book } from '@read-flow/types'
import { MoreHorizontal } from 'lucide-react'

interface BookCardProps {
  book: Book & { progress?: number }
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/reader/${book.id}`)
  }

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className='group relative cursor-pointer' onClick={handleClick}>
      <div className='relative aspect-3/4 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow'>
        <img
          src={book.coverUrl || '/placeholder-book.jpg'}
          alt={book.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
          <div className='absolute bottom-0 left-0 right-0 p-4'>
            {book.progress && book.progress > 0 && book.progress < 100 && (
              <div className='text-white text-sm font-medium mb-2'>
                {book.progress}%
              </div>
            )}
            {book.status === 'finished' && (
              <div className='text-white text-sm font-medium mb-2'>已读完</div>
            )}
            {book.status === 'unread' && (
              <div className='inline-block px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded mb-2'>
                新增
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleMoreClick}
          className='absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-neutral-800/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-800'
        >
          <MoreHorizontal className='h-4 w-4 text-neutral-700 dark:text-neutral-300' />
        </button>
      </div>
      <div className='mt-2 px-1'>
        <h3 className='text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate'>
          {book.title}
        </h3>
        <p className='text-xs text-neutral-500 dark:text-neutral-500 truncate'>
          {book.author}
        </p>
      </div>
      {/* Progress bar for reading books */}
      {book.progress && book.progress > 0 && book.progress < 100 && (
        <div className='mt-2 px-1'>
          <div className='h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-blue-500 transition-all'
              style={{ width: `${book.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
