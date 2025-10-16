import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function Layout() {
  return (
    <div className='flex h-screen bg-neutral-50 dark:bg-neutral-950'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  )
}
