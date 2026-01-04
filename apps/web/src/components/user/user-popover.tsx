import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from '@/lib/auth-client'
import { Profile } from './profile'
import { UserAvatar, UserAvatarSize, userAvatarSizeMap } from './user-avatar'
import { Settings } from '@/components/icon/setting'
import { SignOut } from '@/components/icon/signout'

import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

type UserPopoverProps = {
  avatarSize?: UserAvatarSize
  contentAlign?: 'start' | 'center' | 'end'
}

export function UserPopover({
  avatarSize = 'sm',
  contentAlign = 'start',
}: UserPopoverProps) {
  const { data: session, isPending } = useSession()
  const openAuth = useAuthStore((state) => state.openAuth)
  const navigate = useNavigate()
  const avatarSizeClass = userAvatarSizeMap[avatarSize]

  const handleSettings = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  if (isPending) {
    return (
      <div
        className={cn(
          'size-10 rounded-full bg-neutral-200 animate-pulse',
          avatarSizeClass
        )}
      />
    )
  }

  if (!session) {
    return (
      <button
        type='button'
        onClick={() => openAuth('login')}
        className={cn(
          'flex items-center justify-center rounded-full bg-neutral-900 font-medium text-white transition-colors cursor-pointer',
          avatarSizeClass
        )}
      >
        <User className='h-4 w-4' />
      </button>
    )
  }

  const user = session.user

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type='button' className='outline-none cursor-pointer'>
          <UserAvatar src={user.image} name={user.name} size={avatarSize} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign} className='rounded-3xl p-0'>
        <Profile
          className='shadow-none p-1.5'
          avatarImage={user.image || ''}
          name={user.name}
        />

        <DropdownMenuSeparator className='bg-neutral-200' />

        <DropdownMenuItem
          className='text-primary cursor-pointer rounded-lg px-4 py-2.5 mx-1.5'
          onClick={handleSettings}
        >
          <Settings className='mr-1 size-5 fill-secondary/70' />
          设置
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className='text-primary cursor-pointer rounded-lg px-4 py-2.5 mx-1.5 mb-2'
        >
          <SignOut className='mr-1 size-5 fill-secondary/70' />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
