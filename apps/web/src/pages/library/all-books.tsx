import { BookCard } from './components/book-card'
import { useBooks } from '@/hooks/use-books'

export function AllBooks() {
  const { data: books, isLoading, error } = useBooks()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-neutral-600'>加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-red-600'>加载失败：{error.message}</div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-neutral-900 dark:text-neutral-100'>
          全部
        </h1>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
        {books?.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
