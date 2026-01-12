import { useCredits } from '../../hooks/use-credits'
import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

type CreditDisplayProps = {
  className?: string
}

export function CreditDisplay({ className }: CreditDisplayProps) {
  const { data: credits, isLoading } = useCredits()

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 px-3 py-2 text-sm text-neutral-500'>
        <Coins className='h-4 w-4' />
        <span>加载中...</span>
      </div>
    )
  }

  if (!credits) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
        className
      )}
    >
      <span className='text-neutral-700 flex gap-1.5 items-baseline'>
        <span className='text-foreground text-sm font-medium'>
          {credits.credits.toFixed(0)}
        </span>
        <span className='text-muted-foreground text-xs'>积分</span>
      </span>
    </div>
  )
}
