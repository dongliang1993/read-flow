import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  FileText,
  Users,
  Search,
  HelpCircle,
  Pencil,
  BookOpen,
  BarChart3,
  Network,
  Paperclip,
} from 'lucide-react'

import { useChat } from '@/hooks/use-chat'
import { ChatMessages } from './chat-messages'

type SideChatProps = {
  bookId: string
}

export const SideChat = ({}: SideChatProps) => {
  const { input, setInput, handleSubmit, status, messages } = useChat()

  const quickActions = [
    { icon: FileText, label: '总结这一页的内容' },
    { icon: Lightbulb, label: '解释这个概念' },
    { icon: Users, label: '分析作者的观点' },
    { icon: Search, label: '找出关键信息' },
    { icon: HelpCircle, label: '提出相关问题' },
    { icon: Pencil, label: '生成学习笔记' },
  ]

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
    <div className='flex flex-col h-full dark:bg-neutral-900 px-6 py-3'>
      <div className='flex-1'>
        {/* Header */}
        <div className='pb-1 dark:border-neutral-800'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center'>
              <Lightbulb className='h-6 w-6 text-neutral-600 dark:text-neutral-400' />
            </div>
          </div>
          <h2 className='text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2'>
            AI 阅读助手
          </h2>
          <p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed'>
            智能分析文本内容，提供深度理解和个性化解答，帮助你快速掌握书籍要点。你可以：
          </p>
        </div>

        {/* Quick Actions */}
        <div className='flex-1 overflow-y-auto space-y-2'>
          {quickActions.map((action, index) => (
            <button
              key={index}
              className='w-full flex items-center gap-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group'
            >
              <action.icon className='h-5 w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0' />
              <span className='text-sm text-neutral-700 dark:text-neutral-300 flex-1'>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ChatMessages messages={messages} />

      {/* Bottom Actions */}
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

        {/* Input */}
        <div className='relative'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(input)
              }
            }}
            placeholder='问我任何问题...'
            className='w-full px-4 py-3 pr-12 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary'
          />
          <button className='absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors'>
            <Paperclip className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
          </button>
        </div>
      </div>
    </div>
  )
}
