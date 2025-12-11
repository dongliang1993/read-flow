import {
  Lightbulb,
  FileText,
  Users,
  Search,
  HelpCircle,
  Pencil,
} from 'lucide-react'

import type { QuickPromptType } from '@read-flow/types'

const quickActions = [
  { icon: FileText, label: '总结这一页的内容', quickPromptType: 'summary' },
  { icon: Lightbulb, label: '解释这个概念', quickPromptType: 'analysis' },
  { icon: Users, label: '分析作者的观点', needsContext: true },
  { icon: Search, label: '找出关键信息', quickPromptType: 'question' },
  { icon: HelpCircle, label: '提出相关问题', quickPromptType: 'question' },
  { icon: Pencil, label: '生成学习笔记', quickPromptType: 'note' },
]

type QuickActionsProps = {
  onSelect: (prompt: string, quickPromptType: QuickPromptType) => void
}

export const QuickActions = ({ onSelect }: QuickActionsProps) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex flex-1 flex-col justify-end gap-4'>
        <div className='flex flex-col items-start gap-2 pl-2'>
          <div className='h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center'>
            <Lightbulb className='h-6 w-6 text-neutral-600 dark:text-neutral-400' />
          </div>
          <h2 className='text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2'>
            AI 阅读助手
          </h2>
          <p className='text-sm dark:text-neutral-400 leading-relaxed'>
            智能分析文本内容，提供深度理解和个性化解答，帮助你快速掌握书籍要点。你可以：
          </p>
        </div>

        <div className='space-y-1'>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onSelect(action.label, action.quickPromptType)}
              className='w-full flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group'
            >
              <action.icon className='h-5 w-5 text-neutral-600 dark:text-neutral-400' />
              <span className='text-sm text-neutral-700 dark:text-neutral-300 flex-1'>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
