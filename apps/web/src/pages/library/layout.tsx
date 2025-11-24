import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadBook } from '@/hooks/use-books'

export function LibraryLayout() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  const uploadMutation = useUploadBook()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.epub$/i, ''))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    try {
      await uploadMutation.mutateAsync({ file, title, author })
      setIsUploadOpen(false)
      setFile(null)
      setTitle('')
      setAuthor('')
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className='min-h-screen bg-neutral-50 dark:bg-neutral-950'>
      <header className='bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='max-w-7xl mx-auto px-4 py-2 flex justify-end'>
          <Button
            size='sm'
            onClick={() => setIsUploadOpen(true)}
            className='flex items-center gap-2'
          >
            <Upload className='h-4 w-4' />
            上传书籍
          </Button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {isUploadOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4'>
            <div className='flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800'>
              <h2 className='text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
                上传书籍
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className='text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleUpload} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2'>
                  EPUB 文件
                </label>
                <input
                  type='file'
                  accept='.epub'
                  onChange={handleFileChange}
                  className='w-full text-sm text-neutral-600 dark:text-neutral-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-neutral-100 file:text-neutral-700
                    hover:file:bg-neutral-200
                    dark:file:bg-neutral-800 dark:file:text-neutral-300
                    dark:hover:file:bg-neutral-700'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2'>
                  书名
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='输入书名'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2'>
                  作者（可选）
                </label>
                <input
                  type='text'
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className='w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='输入作者'
                />
              </div>

              <div className='flex gap-3 pt-4'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setIsUploadOpen(false)}
                  className='flex-1'
                >
                  取消
                </Button>
                <Button
                  type='submit'
                  disabled={!file || !title || uploadMutation.isPending}
                  className='flex-1'
                >
                  {uploadMutation.isPending ? '上传中...' : '上传'}
                </Button>
              </div>

              {uploadMutation.isError && (
                <p className='text-sm text-red-600 dark:text-red-400'>
                  上传失败，请重试
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
