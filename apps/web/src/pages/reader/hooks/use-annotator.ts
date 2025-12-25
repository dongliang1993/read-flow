import { useEffect, useState, useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'
import { toast } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { useSelectionTippy } from './use-selection-tippy'
import { useReaderStore } from '@/store/reader-store'
import { noteService } from '@/service/note'
import { createReferenceId } from '@/hooks/use-chat'
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
  const setReferences = useReaderStore((state) => state.setReferences)
  const [showAnnotatorPopup, setShowAnnotatorPopup] = useState(false)
  const [annotatorPopupPosition, setAnnotatorPopupPosition] =
    useState<Position | null>(null)
  const [selection, setSelectionState] = useState<TextSelection | null>(null)

  const globalViewSettings = settings.globalViewSettings

  const annotatorPopupWidth = Math.min(
    globalViewSettings?.vertical ? 320 : 280,
    window.innerWidth - 2 * popupPadding
  )

  const handleSetSelection = useMemoizedFn(
    (selection: TextSelection | null) => {
      setSelectionState(selection)
    }
  )

  // Popup 相关函数
  const handleDismissPopup = useCallback(() => {
    setSelectionState(null)
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
      // 刷新 notes 列表
      queryClient.invalidateQueries({
        queryKey: ['note', bookData.book.id.toString()],
      })

      toast.success('摘录已保存')
    } catch (error) {}
  })

  const copyText = useMemoizedFn(async () => {
    if (!selection || !selection.text) {
      return
    }

    const content = selection.text.trim()
    navigator.clipboard.writeText(content)
    toast.success('文本已复制')
  })

  const askAI = useMemoizedFn(async () => {
    if (!selection || !selection.text) {
      return
    }

    const content = selection.text.trim()
    const reference = {
      id: createReferenceId(),
      text: content,
    }

    setReferences([reference])
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
    setSelection: handleSetSelection,
    showAnnotatorPopup,
    setShowAnnotatorPopup,
    handleDismissPopup,
    createPick,
    copyText,
    askAI,
  }
}
