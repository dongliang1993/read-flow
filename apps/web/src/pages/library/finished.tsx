import { mockBooks } from '../../data/books'
import { BookCard } from './components/book-card'

export function Finished() {
  const finishedBooks = mockBooks.filter((book) => book.status === 'finished')

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-neutral-900 dark:text-neutral-100'>
          已读完
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          共 {finishedBooks.length} 本书
        </p>
      </div>

      {finishedBooks.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
          {finishedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <p className='text-neutral-500 dark:text-neutral-400 text-lg'>
            暂无已读完的书籍
          </p>
        </div>
      )}
    </div>
  )
}
