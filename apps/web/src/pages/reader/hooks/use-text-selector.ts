import { useReaderStore } from '@/store/reader-store'
import { useMemoizedFn } from 'ahooks'
import { useEffect, useRef } from 'react'
import { getTextFromRange, type TextSelection } from '@/utils/position'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { eventDispatcher } from '@/utils/event'
import {
  transformService,
  type TransformContext,
} from '@/service/transform-service'

const isValidSelection = (sel: Selection) => {
  return sel && sel.toString().trim().length > 0 && sel.rangeCount > 0
}

const POPUP_DEBOUNCE_TIME = 300

export const useTextSelector = (
  bookId: string,
  setSelection: React.Dispatch<React.SetStateAction<TextSelection | null>>,
  handleDismissPopup: () => void
) => {
  const { settings } = useAppSettingsStore()
  const bookData = useReaderStore((state) => state.bookData)
  const view = useReaderStore((state) => state.view)
  const isPopupVisible = useRef(false)
  const popupShowTime = useRef<number>(0)

  const globalViewSettings = settings.globalViewSettings

  const primaryLang =
    typeof bookData?.bookDoc?.metadata.language === 'string'
      ? bookData.bookDoc.metadata.language
      : bookData?.bookDoc?.metadata.language?.[0] || 'en'

  const handleScroll = useMemoizedFn(() => {
    handleDismissPopup()
  })

  const getAnnotationText = useMemoizedFn(async (range: Range) => {
    const content = getTextFromRange(
      range,
      (primaryLang as string).startsWith('ja') ? ['rt'] : []
    )

    if (!globalViewSettings) {
      return content
    }

    const transformCtx: TransformContext = {
      bookId,
      viewSettings: globalViewSettings,
      content,
      transformers: ['punctuation'],
      reversePunctuationTransform: true,
    }

    return await transformService.transformContent(transformCtx)
  })

  const makeSelection = useMemoizedFn(async (sel: Selection, index: number) => {
    const range = sel.getRangeAt(0)
    const annotationText = await getAnnotationText(range)
    const selectionObject = { key: bookId, text: annotationText, range, index }
    setSelection(selectionObject)
  })

  const handleMouseUp = useMemoizedFn((doc: Document, index: number) => {
    const sel = doc.getSelection() as Selection

    if (isValidSelection(sel)) {
      makeSelection(sel, index)
    } else {
      handleDismissPopup()
    }
  })

  useEffect(() => {
    const handleSingleClick = (): boolean => {
      if (isPopupVisible.current) {
        const timeSincePopupShow = Date.now() - popupShowTime.current
        if (timeSincePopupShow < POPUP_DEBOUNCE_TIME) {
          return true
        }

        handleDismissPopup()
        view?.deselect()
        isPopupVisible.current = false
        return true
      }
      return false
    }

    eventDispatcher.onSync('iframe-single-click', handleSingleClick)
    return () => {
      eventDispatcher.offSync('iframe-single-click', handleSingleClick)
    }
  }, [])

  return { handleScroll, handleMouseUp }
}
