import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

import { useReaderStore } from '@/store/reader-store'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { Button } from '@/components/ui/button'

import type { FoliateView } from '@/types/view'
import type { ViewSettings } from '@/types/settings'

export const viewPagination = (
  view: FoliateView | null,
  viewSettings: ViewSettings | null | undefined,
  side: 'left' | 'right'
) => {
  if (!view || !viewSettings) return
  const renderer = view.renderer
  if (renderer.scrolled) {
    if (view.book.dir === 'rtl') {
      side = side === 'left' ? 'right' : 'left'
    }
    const { size } = renderer
    const showHeader = viewSettings.showHeader && viewSettings.showBarsOnScroll
    const showFooter = viewSettings.showFooter && viewSettings.showBarsOnScroll
    const scrollingOverlap = viewSettings.scrollingOverlap
    const distance =
      size - scrollingOverlap - (showHeader ? 44 : 0) - (showFooter ? 44 : 0)
    return side === 'left' ? view.prev(distance) : view.next(distance)
  }
  return side === 'left' ? view.goLeft() : view.goRight()
}

export const FooterBar = () => {
  const { view, progress } = useReaderStore(
    useShallow((state) => ({
      view: state.view,
      progress: state.progress,
    }))
  )

  const settings = useAppSettingsStore((state) => state.settings)
  const globalViewSettings = settings.globalViewSettings
  const isScrolledMode = globalViewSettings?.scrolled

  const handleGoPrevPage = () => {
    if (isScrolledMode) {
      if (view) {
        view.renderer.prevSection?.()
      }
    } else {
      if (view) {
        viewPagination(view, globalViewSettings, 'left')
      }
    }
  }

  const handleGoNextPage = () => {
    const isScrolledMode = globalViewSettings?.scrolled
    if (view) {
      if (isScrolledMode) {
        view?.renderer.nextSection?.()
      } else {
        viewPagination(view, globalViewSettings, 'right')
      }
    }
  }

  const isVertical = globalViewSettings?.vertical
  const pageInfo = progress?.pageinfo

  const progressContent = useMemo(() => {
    return pageInfo && pageInfo.current >= 0 && pageInfo.total > 0
      ? isVertical
        ? `${pageInfo.current + 1} · ${pageInfo.total}`
        : `第 ${pageInfo.current + 1} / ${pageInfo.total} 页`
      : ''
  }, [pageInfo])

  console.log('progress', progress)

  return (
    <footer className='w-full h-10 pointer-events-auto px-2 flex items-center'>
      <div className='flex w-full items-center justify-between'>
        <Button
          variant='ghost'
          size='icon'
          className={`size-7 rounded-full transition-opacity duration-300`}
          onClick={handleGoPrevPage}
          title={isScrolledMode ? '上一章' : '上一页'}
        >
          <ChevronLeft className='size-5' />
        </Button>

        <div className='flex justify-center'>
          <span className='text-center text-sm'>{progressContent}</span>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={`size-7 rounded-full transition-opacity duration-300`}
          onClick={handleGoNextPage}
          title={isScrolledMode ? '下一章' : '下一页'}
        >
          <ChevronRight className='size-5' />
        </Button>
      </div>
    </footer>
  )
}
