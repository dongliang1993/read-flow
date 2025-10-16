import { mockBooks } from '../../data/books'
import { BookCard } from '../../components/library/book-card'

export function AllBooks() {
  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-neutral-900 dark:text-neutral-100'>
          全部
        </h1>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
        {mockBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
