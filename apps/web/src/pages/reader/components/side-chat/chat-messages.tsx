import type { UIMessage } from 'ai'
import { useState, useCallback } from 'react'

import { SharedCard } from '@/components/shared-card'
import { MessageItem } from './message-item'

import { cn } from '@/lib/utils'

type ChatMessagesProps = {
  messages: UIMessage[]
  className?: string
}

export const ChatMessages = ({ messages, className }: ChatMessagesProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareContent, setShareContent] = useState('')

  const handleShareOpen = useCallback((content: string) => {
    setShowShareDialog(true)
    setShareContent(content)
  }, [])

  return (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto max-w-full',
        className
      )}
    >
      {messages.map((message: UIMessage) => {
        return (
          <MessageItem
            key={message.id}
            message={message}
            onShareOpen={handleShareOpen}
          />
        )
      })}

      <SharedCard
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        content={shareContent}
      />
    </div>
  )
}
