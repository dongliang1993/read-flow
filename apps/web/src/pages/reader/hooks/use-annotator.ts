import { useEffect, useState, useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'
import { toast } from 'sonner'

import { useAppSettingsStore } from '@/store/app-settings-store'
import { useSelectionTippy } from './use-selection-tippy'
import { useReaderStore } from '@/store/reader-store'
import { noteService } from '@/service/note'
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
  const bookData = useReaderStore((state) => state.bookData)
  const [showAnnotatorPopup, setShowAnnotatorPopup] = useState(false)
  const [annotatorPopupPosition, setAnnotatorPopupPosition] =
    useState<Position | null>(null)
  const [selection, setSelection] = useState<TextSelection | null>(null)

  const globalViewSettings = settings.globalViewSettings

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

  /**
   * 创建摘录
   */
  const createPick = useMemoizedFn(async () => {
    if (!selection || !selection.text) {
      return
    }

    try {
      const content = selection.text.trim()

      if (!bookData?.book) {
        toast.error('无法获取书籍信息')
        return
      }

      const bookNote = {
        title: bookData.book.title,
        author: bookData.book.author,
        bookId: bookData.book.id.toString(),
        source: {
          bookId: bookData.book.id.toString(),
          plain: content,
          raw: content,
        },
      }

      await noteService.createNote(bookNote)
      handleDismissPopup()
      toast.success('摘录已保存')
    } catch (error) {}
  })

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
    createPick,
  }
}
