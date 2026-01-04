import { cn } from '@/lib/utils'

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg'

type UserAvatarProps = {
  src?: string | null
  name?: string | null
  size?: UserAvatarSize
  className?: string
  showBorder?: boolean
}

export const userAvatarSizeMap = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const borderSizeMap = {
  sm: 'p-[2px]',
  md: 'p-[2px]',
  lg: 'p-[3px]',
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
  showBorder = false,
}: UserAvatarProps) {
  const avatarContent = src ? (
    <img
      src={src}
      alt={name || 'User avatar'}
      className={cn(
        'rounded-full object-cover bg-neutral-100',
        userAvatarSizeMap[size]
      )}
    />
  ) : (
    <div
      className={cn(
        'rounded-full bg-neutral-200 flex items-center justify-center font-medium text-neutral-600',
        sizeMap[size]
      )}
    >
      {getInitials(name)}
    </div>
  )

  if (!showBorder) {
    return <div className={className}>{avatarContent}</div>
  }

  return (
    <div
      className={cn(
        'group relative rounded-full cursor-pointer',
        borderSizeMap[size],
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-[conic-gradient(from_0deg,#ff0000,#ff8000,#ffff00,#80ff00,#00ff80,#00ffff,#0080ff,#8000ff,#ff0080,#ff0000)]',
          'animate-[spin_2s_linear_infinite]'
        )}
      />
      <div className='relative rounded-full bg-white'>{avatarContent}</div>
    </div>
  )
}
