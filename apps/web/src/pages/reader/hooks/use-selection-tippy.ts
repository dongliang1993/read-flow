// use-selection-tippy.ts
import { useEffect, useRef, useState } from 'react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { useMemoizedFn } from 'ahooks'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import 'tippy.js/dist/tippy.css'

export const useSelectionTippy = () => {
  const tippyRef = useRef<TippyInstance | null>(null)
  const rootRef = useRef<Root | null>(null)

  const [selection, setSelection] = useState<{
    text: string
    range: Range
  } | null>(null)

  const hideTippy = useMemoizedFn(() => {
    if (tippyRef.current) {
      tippyRef.current.hide()
      tippyRef.current.destroy()
      tippyRef.current = null
    }
    setSelection(null)
  })

  // 创建或更新 tippy 实例
  const showTippy = useMemoizedFn((range: Range, content: React.ReactNode) => {
    // 销毁旧实例
    hideTippy()

    const container = document.createElement('div')
    rootRef.current = createRoot(container)
    rootRef.current.render(content)

    // 获取 range 所在的 document
    const rangeDoc = range.startContainer.ownerDocument
    // 获取 iframe（如果有）
    const iframe = rangeDoc?.defaultView
      ?.frameElement as HTMLIFrameElement | null

    // 创建 tippy 实例
    tippyRef.current = tippy(document.body, {
      getReferenceClientRect: () => {
        const rangeRect = range.getBoundingClientRect()

        // 如果在 iframe 中，需要转换坐标
        if (iframe) {
          const iframeRect = iframe.getBoundingClientRect()
          return {
            width: rangeRect.width,
            height: rangeRect.height,
            top: rangeRect.top + iframeRect.top,
            bottom: rangeRect.bottom + iframeRect.top,
            left: rangeRect.left + iframeRect.left,
            right: rangeRect.right + iframeRect.left,
            x: rangeRect.x + iframeRect.left,
            y: rangeRect.y + iframeRect.top,
          } as DOMRect
        }

        return rangeRect
      },
      appendTo: document.body,
      content: container,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      arrow: false,
      theme: 'light-border',
      onHide: () => {
        setSelection(null)
      },
    })
  })

  // 清理
  useEffect(() => {
    return () => {
      if (tippyRef.current) {
        tippyRef.current.destroy()
      }
    }
  }, [])

  return {
    showTippy,
    hideTippy,
    selection,
    setSelection,
    tippyInstance: tippyRef,
  }
}
