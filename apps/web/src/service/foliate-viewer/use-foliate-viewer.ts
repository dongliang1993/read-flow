import { useRef, useState, useEffect } from 'react'
import { FoliateViewerManager } from './index'
import { useReaderStore } from '@/store/reader-store'
import { useAppSettingsStore } from '@/store/app-settings-store'

import type { FoliateView } from '@/types/view'
import type { BookConfig, BookDoc } from '@/types/book'
import type { Insets } from '@/types/misc'

export const useFoliateViewer = (
  bookId: string,
  bookDoc: BookDoc,
  config: BookConfig,
  insets: Insets
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<FoliateViewerManager | null>(null)
  const viewRef = useRef<FoliateView | null>(null)
  const isInitialized = useRef(false)
  const [, forceUpdate] = useState({})
  const setView = useReaderStore((state) => state.setView)
  const settings = useAppSettingsStore((state) => state.settings)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isInitialized.current || !containerRef.current) {
      console.log(
        '[useFoliateViewer] Skipping init - isInitialized:',
        isInitialized.current,
        'containerRef:',
        !!containerRef.current
      )
      return
    }

    console.log('[useFoliateViewer] Starting initialization')
    isInitialized.current = true

    const manager = new FoliateViewerManager({
      bookId,
      bookDoc,
      config,
      container: containerRef.current,
      insets,
      globalViewSettings: settings.globalViewSettings,
      onViewCreated: (view) => {
        setView(view)
        viewRef.current = view
      },
    })

    managerRef.current = manager

    manager
      .initialize()
      .then(() => {
        forceUpdate({})
      })
      .catch((error) => {
        console.error('Failed to initialize foliate viewer:', error)
      })

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
      viewRef.current = null
      isInitialized.current = false
    }
  }, [])

  return {
    containerRef,
    managerRef,
    viewRef,
    isInitialized,
    getView: () => managerRef.current?.getView() || null,
  }
}
