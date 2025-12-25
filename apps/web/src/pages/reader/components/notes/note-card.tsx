import { Book, Copy, Trash2, FileText, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'

import type { ListNote } from '@read-flow/types'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type NoteCardProps = {
  note: ListNote
  onAddComment?: () => void
  onCopy?: () => void
  onDelete?: () => void
  onShared?: (content: string) => void
}

export const NoteCard = ({
  note,
  onAddComment,
  onCopy,
  onDelete,
  onShared,
}: NoteCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
    locale: zhCN,
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(note.sourcePlain)
    onCopy?.()
    toast.success('已复制到剪贴板')
  }

  const handleShared = () => {
    onShared?.(note.sourcePlain)
  }

  return (
    <div className='rounded-xl border bg-card p-2'>
      <div className='mb-1 flex items-center justify-between'>
        <span className='text-sm text-neutral-400'>{timeAgo}</span>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAddComment}
                className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer'
              >
                <FileText size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>添加注释</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer'
              >
                <Copy size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>复制</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleShared}
                className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer'
              >
                <Share2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>分享</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer'
              >
                <Trash2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>删除</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className='flex gap-3'>
        <div className='w-1 shrink-0 rounded-full bg-neutral-300' />
        <div
          className='prose prose-sm prose-neutral max-w-none flex-1'
          dangerouslySetInnerHTML={{ __html: note.sourceRaw }}
        />
      </div>

      <div className='mt-3 flex items-center gap-1.5 text-sm text-neutral-400'>
        <Book size={14} />
        <span>{note.title}</span>
      </div>
    </div>
  )
}
