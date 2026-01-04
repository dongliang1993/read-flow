import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import { UserPopover } from '@/components/user/user-popover'
import { Logo } from '@/components/logo'

export const Header = () => {
  const navigate = useNavigate()

  const handleLogoClick = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className='h-13 w-full py-3 px-2 flex'>
      <div className='flex-1'>
        <Logo className='cursor-pointer' onClick={handleLogoClick} />
      </div>
      <UserPopover avatarSize='sm' contentAlign='end' />
    </div>
  )
}
