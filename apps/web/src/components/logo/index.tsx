import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  onClick?: () => void
}

export const Logo = ({ className, onClick }: LogoProps) => {
  return (
    <div
      className={cn(
        'inline-block text-xl font-bold text-neutral-900',
        className
      )}
      onClick={onClick}
    >
      Read Flow
    </div>
  )
}
