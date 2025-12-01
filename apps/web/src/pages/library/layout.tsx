import { Outlet } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useBookUpload } from '@/hooks/use-book-upload'
import { useLibraryStore } from '@/store/library-store'

export function LibraryLayout() {
  const isInitiating = useRef(false)

  const { triggerFileSelect, isUploading } = useBookUpload()
  const { refreshBooks, isLoading, error } = useLibraryStore()

  useEffect(() => {
    if (isInitiating.current) {
      return
    }

    isInitiating.current = true

    const init = async () => {
      await refreshBooks()
    }

    init()

    return () => {
      isInitiating.current = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className='h-full w-full flex items-center justify-center p-8'>
        <div className='text-neutral-600'>加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='h-full w-full flex items-center justify-center p-8'>
        <div className='text-red-600'>加载失败：{error}</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      <header className='bg-white border-b border-neutral-200 dark:border-neutral-800'>
        <div className='max-w-7xl mx-auto px-4 py-2 flex justify-end'>
          <Button
            size='sm'
            variant='secondary'
            onClick={triggerFileSelect}
            className='flex items-center gap-2'
          >
            {isUploading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white' />
                上传中...
              </>
            ) : (
              <>
                <Upload size={16} />
                上传书籍
              </>
            )}
          </Button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
