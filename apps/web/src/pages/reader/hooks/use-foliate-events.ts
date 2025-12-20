import { useEffect } from 'react'
import type { FoliateView } from '@/types/view'

type FoliateEventHandler = {
  onLoad?: (event: Event) => void
  onRelocate?: (event: Event) => void
  onLinkClick?: (event: Event) => void
  onRendererRelocate?: (event: Event) => void
  onDrawAnnotation?: (event: Event) => void
  onShowAnnotation?: (event: Event) => void
}

export const useFoliateEvents = (
  view: FoliateView | null,
  handlers: FoliateEventHandler
) => {
  const onLoad = handlers?.onLoad

  useEffect(() => {
    if (!view) {
      return
    }

    if (onLoad) {
      view.addEventListener('load', onLoad)
    }

    return () => {
      if (onLoad) {
        view.removeEventListener('load', onLoad)
      }
    }
  }, [view])
}
