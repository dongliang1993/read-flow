import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import {
  StickToBottom,
  type StickToBottomContext,
  useStickToBottomContext,
} from 'use-stick-to-bottom'

function AutoScrollController({ autoScroll }: { autoScroll: boolean }) {
  const { stopScroll } = useStickToBottomContext()

  useEffect(() => {
    if (!autoScroll) {
      stopScroll()
    }
  }, [autoScroll, stopScroll])

  return null
}

type ScrollContainerProps = {
  children: React.ReactNode
  autoScroll?: boolean
  resize?: 'auto' | 'instant' | 'smooth'
  initial?: 'auto' | 'instant' | 'smooth' | boolean
  className?: string

  contextRef?: React.RefObject<StickToBottomContext>
}

export const ScrollContainer = ({
  children,
  autoScroll = true,
  initial = 'auto',
  contextRef,
  resize = 'auto',
  className,
}: ScrollContainerProps) => {
  return (
    <StickToBottom
      className={cn('flex overflow-y-auto', className)}
      resize={resize}
      initial={initial}
      contextRef={contextRef}
      role='log'
    >
      <AutoScrollController autoScroll={autoScroll} />
      <StickToBottom.Content>{children}</StickToBottom.Content>
    </StickToBottom>
  )
}
