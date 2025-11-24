import { useBooks, useDeleteBook, useDownloadBook } from '@/hooks/use-books'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BookList() {
  const { data: books, isLoading, error } = useBooks()
  const deleteBook = useDeleteBook()
  const downloadBook = useDownloadBook()

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

  if (!books || books.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-neutral-600'>暂无书籍</div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {books.map((book) => (
        <Card key={book.id} className='p-4'>
          <div className='flex flex-col gap-2'>
            <h3 className='text-lg font-semibold'>{book.title}</h3>
            {book.author && (
              <p className='text-sm text-neutral-600'>{book.author}</p>
            )}
            {book.fileSize && (
              <p className='text-xs text-neutral-500'>
                大小: {(book.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            <div className='mt-2 flex gap-2'>
              <Button
                size='sm'
                onClick={() => downloadBook.mutate(book.id)}
                disabled={downloadBook.isPending}
              >
                {downloadBook.isPending ? '下载中...' : '下载'}
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => {
                  if (confirm(`确定要删除《${book.title}》吗？`)) {
                    deleteBook.mutate(book.id)
                  }
                }}
                disabled={deleteBook.isPending}
              >
                {deleteBook.isPending ? '删除中...' : '删除'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
