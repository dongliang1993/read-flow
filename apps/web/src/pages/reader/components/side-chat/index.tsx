import { useCallback } from 'react'
import { BookOpen, BarChart3, Network } from 'lucide-react'

import { useChat } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import { QuickActions } from './quick-actions'

type SideChatProps = {
  bookId: string
}

export const SideChat = ({ bookId }: SideChatProps) => {
  const { input, setInput, handleSubmit, status, messages } = useChat({
    chatContext: {
      activeBookId: bookId,
    },
  })

  console.log('SideChat', messages)
  const bottomActions = [
    {
      icon: BookOpen,
      label: '总结本章',
      prompt: '请帮我总结本章的核心要点和结论。',
    },
    {
      icon: BarChart3,
      label: '分析观点',
      prompt: '请分析作者的观点，指出论据与可能的偏见。',
    },
    {
      icon: Network,
      label: '生成思维导图',
      prompt: '请基于当前内容生成思维导图。',
    },
  ]

  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      setInput(prompt)

      if (status === 'ready') {
        handleSubmit(prompt)
      }
    },
    [setInput]
  )

  return (
    <div
      id='side-chat'
      className='flex flex-col h-full overflow-hidden px-3 py-3'
    >
      {messages.length === 0 ? (
        <QuickActions onSelect={handleQuickPrompt} />
      ) : (
        <ChatMessages messages={messages} />
      )}

      <div className='py-3'>
        <div className='flex gap-2 mb-3'>
          {bottomActions.map((action, index) => (
            <Button
              key={index}
              variant='outline'
              size='sm'
              className='flex-1 gap-2 text-xs'
              onClick={() => handleQuickPrompt(action.prompt)}
            >
              <action.icon className='h-3.5 w-3.5' />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <ChatInput
        status={status}
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  )
}
