import { useMemo, useEffect } from 'react'
import { BotMessageSquare, Copy } from 'lucide-react'

import { useAnnotator } from '../../hooks/use-annotator'
import { useTextSelector } from '../../hooks/use-text-selector'
import { useFoliateEvents } from '../../hooks/use-foliate-events'
import { AnnotatorPopup, type PopupButtonProps } from './annotator-popup'
import { useReaderStore } from '@/store/reader-store'
import { PickIcon } from '@/components/icon/pick'

export const Annotator = () => {
  const view = useReaderStore((state) => state.view)
  const bookId = useReaderStore((state) => state.bookData)?.id!

  const {
    setSelection,
    selection,
    showTippy,
    handleDismissPopup,
    showAnnotatorPopup,
    createPick,
  } = useAnnotator(bookId)

  const { handleScroll, handleMouseUp } = useTextSelector(
    bookId,
    setSelection,
    handleDismissPopup
  )

  const buttons: PopupButtonProps[] = [
    {
      label: '摘录',
      key: 'pick',
      icon: <PickIcon size={16} className='text-black' />,
      onClick: createPick,
    },
    {
      label: '复制',
      key: 'copy',
      icon: <Copy size={16} className='text-black' />,
      onClick: () => {
        console.log('注释')
      },
    },
    {
      label: 'Chat with AI',
      key: 'delete',
      icon: <BotMessageSquare size={16} className='text-black' />,
      dividerBefore: true,
      onClick: () => {
        console.log('删除')
      },
    },
  ]

  const handlers = useMemo(
    () => ({
      onLoad: (event: Event) => {
        const detail = (event as CustomEvent).detail
        const { doc, index } = detail

        view?.renderer?.addEventListener('scroll', handleScroll)

        if (detail.doc) {
          detail.doc.addEventListener('mouseup', () => {
            handleMouseUp(doc, index)
          })
        }
      },
    }),
    [view, handleScroll]
  )

  useFoliateEvents(view, handlers)

  useEffect(() => {
    if (selection && showAnnotatorPopup) {
      showTippy(selection.range, <AnnotatorPopup buttons={buttons} />)
    }
  }, [selection, showAnnotatorPopup])

  return <div id='chat-select-pop' className='fixed'></div>
}
