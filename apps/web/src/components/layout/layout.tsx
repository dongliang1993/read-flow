import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

import { Sidebar } from './sidebar'
import { useAppSettingsStore } from '@/store/app-settings-store'

export function Layout() {
  const initialize = useAppSettingsStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className='flex h-screen bg-shade-01'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  )
}
