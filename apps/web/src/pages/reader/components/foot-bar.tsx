import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

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
  const { view } = useReaderStore(
    useShallow((state) => ({
      view: state.view,
    }))
  )

  const settings = useAppSettingsStore((state) => state.settings)
  const globalViewSettings = settings.globalViewSettings

  const handleGoPrevPage = () => {
    const isScrolledMode = globalViewSettings?.scrolled
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

  return (
    <footer className='w-full h-10 pointer-events-auto px-2 flex items-center'>
      <div className='flex w-full items-center justify-between'>
        <Button
          variant='ghost'
          size='icon'
          className={`size-7 rounded-full transition-opacity duration-300`}
          onClick={handleGoPrevPage}
          title={'上一页'}
        >
          <ChevronLeft className='size-5' />
        </Button>

        <div className='flex justify-center'>
          <span className='text-center text-sm'>{11}</span>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={`size-7 rounded-full transition-opacity duration-300`}
          onClick={handleGoNextPage}
          title={'下一页'}
        >
          <ChevronRight className='size-5' />
        </Button>
      </div>
    </footer>
  )
}
