import type { UIMessage } from 'ai'
import { useState, useCallback, useRef } from 'react'

import { SharedCard } from '@/components/shared-card'
import { MessageItem } from './message-item'
import { ThinkingMessage } from './thinking-message'

import { cn } from '@/lib/utils'

import type { UseChatHelpers } from '@ai-sdk/react'
import type { ChatMessage } from '@/types/message'

type ChatMessagesProps = {
  messages: UIMessage[]
  className?: string
  status: UseChatHelpers<ChatMessage>['status']
}

export const ChatMessages = ({
  messages,
  className,
  status,
}: ChatMessagesProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareContent, setShareContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleShareOpen = useCallback((content: string) => {
    setShowShareDialog(true)
    setShareContent(content)
  }, [])

  return (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto max-w-full ',
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

      {status === 'submitted' &&
        !messages.some((msg) => msg.parts?.some((part) => 'state' in part)) && (
          <ThinkingMessage />
        )}

      <div
        className='min-h-[24px] min-w-[24px] shrink-0'
        ref={messagesEndRef}
      />

      <SharedCard
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        content={shareContent}
      />
    </div>
  )
}
