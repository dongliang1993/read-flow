import { useEffect, useState, useCallback } from 'react'

import { useAppSettingsStore } from '@/store/app-settings-store'
import { useSelectionTippy } from './use-selection-tippy'

import {
  getPosition,
  getPopupPosition,
  type Position,
  type TextSelection,
} from '@/utils/position'

const popupPadding = 10
const annotatorPopupHeight = 36

export const useAnnotator = (bookId: string) => {
  const { settings } = useAppSettingsStore()
  const { showTippy, hideTippy } = useSelectionTippy()

  const globalViewSettings = settings.globalViewSettings

  const [showAnnotatorPopup, setShowAnnotatorPopup] = useState(false)
  const [annotatorPopupPosition, setAnnotatorPopupPosition] =
    useState<Position | null>(null)

  // 状态管理
  const [selection, setSelection] = useState<TextSelection | null>(null)

  const annotatorPopupWidth = Math.min(
    globalViewSettings?.vertical ? 320 : 280,
    window.innerWidth - 2 * popupPadding
  )

  // Popup 相关函数
  const handleDismissPopup = useCallback(() => {
    setSelection(null)
    setShowAnnotatorPopup(false)
    hideTippy()
  }, [])

  // Popup 位置计算
  useEffect(() => {
    if (selection && selection.text.trim().length > 0) {
      const gridFrame = document.querySelector(`#reader-${bookId}`)

      if (!gridFrame) {
        return
      }

      const rect = gridFrame.getBoundingClientRect()
      const triangPos = getPosition(
        selection.range,
        rect,
        popupPadding,
        globalViewSettings?.vertical
      )
      const annotPopupPos = getPopupPosition(
        triangPos,
        rect,
        globalViewSettings?.vertical
          ? annotatorPopupHeight
          : annotatorPopupWidth,
        globalViewSettings?.vertical
          ? annotatorPopupWidth
          : annotatorPopupHeight,
        popupPadding
      )

      if (triangPos.point.x === 0 || triangPos.point.y === 0) {
        return
      }

      setAnnotatorPopupPosition(annotPopupPos)
      setShowAnnotatorPopup(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, bookId])

  useEffect(() => {
    const handleIframeClick = (event: MessageEvent) => {
      if (
        event.data?.type === 'iframe-single-click' &&
        event.data?.bookId === bookId
      ) {
        handleDismissPopup()
      }
    }

    window.addEventListener('message', handleIframeClick)

    return () => {
      window.removeEventListener('message', handleIframeClick)
    }
  }, [bookId])

  return {
    showTippy,
    selection,
    setSelection,
    showAnnotatorPopup,
    setShowAnnotatorPopup,
    handleDismissPopup,
  }
}
