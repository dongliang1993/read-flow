import { useRef, useState, useCallback } from 'react'
import { toPng, toBlob } from 'html-to-image'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ShareCardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
}

export const ShareCardDialog = ({
  open,
  onOpenChange,
  content,
}: ShareCardDialogProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copying, setCopying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return

    try {
      setDownloading(true)

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        height: cardRef.current.scrollHeight,
        width: cardRef.current.scrollWidth,
        style: {
          maxHeight: 'none',
          overflow: 'visible',
        },
      })

      const link = document.createElement('a')
      link.download = `share-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      toast.success('图片已下载')
    } catch (error) {
      console.error(error)
      toast.error('下载失败')
    } finally {
      setDownloading(false)
    }
  }, [cardRef])

  const handleCopy = useCallback(async () => {
    if (!cardRef.current) return

    try {
      setCopying(true)

      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        height: cardRef.current.scrollHeight,
        width: cardRef.current.scrollWidth,
        style: {
          maxHeight: 'none',
          overflow: 'visible',
        },
      })

      if (!blob) throw new Error('Failed to create blob')

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error(error)
      toast.error('复制失败')
    } finally {
      setCopying(false)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg p-5 sm:rounded-3xl'>
        <DialogHeader>
          <DialogTitle className='text-md'>分享卡片</DialogTitle>
        </DialogHeader>
        <div className='w-full overflow-hidden rounded-xl border border-muted'>
          <div className='overflow-x-hidden overflow-y-auto max-h-[60vh]'>
            <div ref={cardRef} className='p-8 pointer-events-none box-content'>
              <div className='prose prose-sm prose-neutral max-w-none'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
              <div className='mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-400'>
                <span>Read Flow</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full flex items-center justify-end gap-4'>
          <Button
            variant='soft'
            className='cursor-pointer rounded-full h-8 px-4 bg-transparent border hover:bg-neutral-100 text-center'
            size='sm'
            disabled={copying || downloading}
            onClick={handleCopy}
          >
            {copying ? <Loader2 className='animate-spin' size={12} /> : '复制'}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={copying || downloading}
            className='cursor-pointer rounded-full h-8 px-4 text-center'
            size='sm'
          >
            {downloading ? (
              <Loader2 className='animate-spin' size={12} />
            ) : (
              '下载图片'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
