import { Pointer, Sparkles } from 'lucide-react'

// 叠加两个图标
export const ExcerptIcon = ({ className }: { className?: string }) => (
  <div className='relative inline-block'>
    <Pointer className={className} />
    <Sparkles className='absolute -top-1 -right-1 w-3 h-3 text-amber-500' />
  </div>
)
