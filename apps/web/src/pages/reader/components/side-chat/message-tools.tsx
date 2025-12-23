import { useState, useRef, useCallback } from 'react'
import { Copy, Share2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

type MessageToolsProps = {
  content: string
  plainText: string
  onShareOpen: (content: string) => void
}

export const MessageTools = ({
  content,
  plainText,
  onShareOpen,
}: MessageToolsProps) => {
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content)
    toast.success('已复制 Markdown')
  }, [content])

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(plainText)
    toast.success('已复制文本')
  }, [plainText])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer()
    setShowCopyDialog(true)
  }, [clearCloseTimer])

  const handleMouseLeave = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setShowCopyDialog(false)
    }, 120)
  }, [clearCloseTimer])

  const handleShareOpen = useCallback(() => {
    onShareOpen(content)
  }, [onShareOpen, content])

  return (
    <Tooltip>
      <div className='flex items-center gap-0.5 text-neutral-400'>
        <DropdownMenu
          modal={false}
          open={showCopyDialog}
          onOpenChange={setShowCopyDialog}
        >
          <DropdownMenuTrigger
            asChild
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
          >
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1 px-1.5 cursor-pointer outline-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <Copy size={14} />
              <ChevronDown
                size={12}
                className={cn(
                  'transition-transform duration-200',
                  showCopyDialog ? 'rotate-180' : ''
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='start'
            className='border-none'
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
          >
            <DropdownMenuItem onClick={handleCopyMarkdown}>
              复制为 Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyText}>
              复制为文本
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-1.5 cursor-pointer'
            onClick={handleShareOpen}
          >
            <Share2 size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent arrow={false}>
          <p>分享</p>
        </TooltipContent>
      </div>
    </Tooltip>
  )
}
