import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

import { Sidebar } from './sidebar'
import { useProviderStore } from '@/store/provider-store'

export function Layout() {
  const initializeProviderStore = useProviderStore((state) => state.initialize)

  useEffect(() => {
    initializeProviderStore()
  }, [])

  return (
    <div className='flex h-screen bg-shade-01'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  )
}
