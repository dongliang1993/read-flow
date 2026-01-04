import { Outlet } from 'react-router-dom'
import { CloudUpload } from 'lucide-react'
import { useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useBookUpload } from '@/hooks/use-book-upload'
import { useLibraryStore } from '@/store/library-store'

const Library = ({ className }: { className?: string }) => {
  const isInitiating = useRef(false)
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
    <main className={className}>
      <Outlet />
    </main>
  )
}

export function LibraryLayout() {
  const { triggerFileSelect, isUploading } = useBookUpload()

  return (
    <div className='min-h-screen bg-shade-01 flex flex-col'>
      <header className='border-b border-neutral-200 sticky top-0 z-10 bg-shade-01'>
        <div className='w-full px-5 py-3 flex justify-end'>
          <Button
            size='sm'
            onClick={triggerFileSelect}
            className='flex items-center gap-2 cursor-pointer border rounded-full'
          >
            {isUploading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white' />
                上传中...
              </>
            ) : (
              <>
                <CloudUpload size={16} />
                上传书籍
              </>
            )}
          </Button>
        </div>
      </header>
      <main className='flex-1'>
        <Library />
      </main>
    </div>
  )
}
