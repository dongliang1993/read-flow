import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { SettingsDropdown } from './settings-dropdown'
import { TOCViewDropdown } from './toc-view'

import { getBookDisplayTitle } from '@/utils/book'
import { useReaderStore } from '@/store/reader-store'

const HeaderBar = () => {
  const navigate = useNavigate()
  const bookData = useReaderStore((state) => state.bookData)

  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const bookDisplayTitle = useMemo(() => {
    const title = bookData?.book?.title
    return getBookDisplayTitle(title)
  }, [bookData?.book])

  return (
    <header className='w-full shrink-0 px-4 py-1'>
      <div className='flex items-center justify-between'>
        {/* 操作按钮区 */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 cursor-pointer'
            onClick={handleGoBack}
          >
            <ArrowLeft size={18} />
          </Button>
          <TOCViewDropdown toc={bookData?.bookDoc?.toc || []} />
        </div>

        {/* 书籍标题 */}
        <div className='flex-1'>
          <h1 className='text-sm font-medium text-primary text-center'>
            {bookDisplayTitle}
          </h1>
        </div>

        {/* 设置按钮 */}
        <SettingsDropdown />
      </div>
    </header>
  )
}

export default HeaderBar
