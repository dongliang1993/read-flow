import { mockBooks } from '../../data/books'
import { BookCard } from './components/book-card'

export function Reading() {
  const readingBooks = mockBooks.filter((book) => book.status === 'reading')

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-neutral-900 dark:text-neutral-100'>
          正在阅读
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          共 {readingBooks.length} 本书
        </p>
      </div>

      {readingBooks.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
          {readingBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <p className='text-neutral-500 dark:text-neutral-400 text-lg'>
            暂无正在阅读的书籍
          </p>
        </div>
      )}
    </div>
  )
}
