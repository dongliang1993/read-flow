import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import SettingsDropdown from './settings-dropdown'
import { TOCViewDropdown } from './toc-view'
import { useReaderStore } from '@/store/reader-store'

type HeaderBarProps = {}

const HeaderBar = ({}: HeaderBarProps) => {
  const navigate = useNavigate()
  const bookData = useReaderStore((state) => state.bookData)

  return (
    <header className='w-full shrink-0 px-4 py-1'>
      <div className='flex items-center justify-between'>
        {/* 目录按钮 */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
          <TOCViewDropdown toc={bookData?.bookDoc?.toc || []} />
        </div>

        {/* 书籍标题 */}
        <div className='flex-1'>
          <h1 className='text-sm font-medium text-neutral-900 dark:text-neutral-100 text-center'>
            {bookData?.book?.title}
          </h1>
        </div>

        {/* 设置按钮 */}
        <SettingsDropdown />
      </div>
    </header>
  )
}

export default HeaderBar
