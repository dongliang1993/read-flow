import { BookOpen, BarChart3, Network } from 'lucide-react'
import { useMemoizedFn } from 'ahooks'

import { Button } from '@/components/ui/button'
import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import { QuickActions } from './quick-actions'
import { ScrollContainer } from './scroll-container'

import { useChat } from '@/hooks/use-chat'
import { useReaderStore } from '@/store/reader-store'
import { useSelectionToReferences } from '../../hooks/use-selection-to-references'
import { createBookService } from '@/service/books/book-service'

import type { QuickPromptType } from '@read-flow/types'

type SideChatProps = {
  bookId: string
}

export const SideChat = ({ bookId }: SideChatProps) => {
  const view = useReaderStore((state) => state.view)
  const progress = useReaderStore((state) => state.progress)
  const selection = useReaderStore((state) => state.selection)

  const {
    input,
    setInput,
    handleSubmit,
    status,
    messages,
    stop,
    setChatContext,
    references,
    setReferences,
  } = useChat({
    chatContext: {
      activeBookId: bookId,
    },
  })

  useSelectionToReferences(selection, {
    afterTransform: (refs) => {
      setReferences(refs)
    },
  })

  const bottomActions: {
    icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode
    label: string
    prompt: string
    quickPromptType: QuickPromptType
  }[] = [
    {
      icon: BookOpen,
      label: '总结本章',
      prompt: '请帮我总结本章的核心要点和结论。',
      quickPromptType: 'summary',
    },
    {
      icon: BarChart3,
      label: '分析观点',
      prompt: '请分析作者的观点，指出论据与可能的偏见。',
      quickPromptType: 'analysis',
    },
    {
      icon: Network,
      label: '生成思维导图',
      prompt: '请基于当前内容生成思维导图（用文本形式呈现）。',
      quickPromptType: 'mindmap',
    },
  ]

  const handleQuickPrompt = useMemoizedFn(
    async (prompt: string, quickPromptType: QuickPromptType) => {
      setInput(prompt)

      if (status === 'ready') {
        if (quickPromptType && view) {
          const bookService = createBookService(view.book)
          const sectionContent = await bookService.getChapterContent(
            progress?.sectionHref || ''
          )

          setChatContext({
            quickPromptType,
            activeBookId: bookId,
            sectionHref: progress?.sectionHref || '',
            sectionId: progress?.sectionId || 0,
            sectionLabel: progress?.sectionLabel || '',
            sectionContent: sectionContent?.content || '',
          })
        }

        handleSubmit(prompt)
      }
    }
  )

  return (
    <div id='side-chat' className='flex flex-col h-full'>
      <div className='flex items-center justify-between h-6'>
        <h2 className='text-sm font-medium'>对话</h2>
      </div>
      {messages.length === 0 ? (
        <QuickActions onSelect={handleQuickPrompt} />
      ) : (
        <ScrollContainer className='relative flex-1 mx-[-14px]' autoScroll>
          <ChatMessages className='px-4' messages={messages} />
        </ScrollContainer>
      )}

      <div className='my-2.5'>
        <div className='flex gap-2'>
          {bottomActions.map((action, index) => (
            <Button
              key={index}
              variant='outline'
              size='sm'
              className='flex-1 gap-2 text-xs rounded-3xl'
              onClick={() =>
                handleQuickPrompt(action.prompt, action.quickPromptType)
              }
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
        references={references}
        setReferences={setReferences}
      />
    </div>
  )
}
