import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Library,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  CircleGauge,
} from 'lucide-react'
import { Resizable } from 're-resizable'

import { cn } from '@/lib/utils'

const dashboardItem = {
  title: '仪表盘',
  href: '/dashboard',
  icon: LayoutDashboard,
}

export function Sidebar() {
  const [width, setWidth] = useState(260)
  const librarySection = {
    title: '书库',
    items: [
      {
        title: '全部',
        href: '/library/all',
        icon: Library,
      },
      {
        title: '正在阅读',
        href: '/library/reading',
        icon: Clock,
      },
      {
        title: '已读完',
        href: '/library/finished',
        icon: CheckCircle2,
      },
    ],
  }

  return (
    <Resizable
      size={{ width, height: '100vh' }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width)
      }}
      minWidth={160}
      maxWidth={260}
      enable={{
        right: true,
        top: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      className='h-screen bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col'
    >
      {/* Header */}
      <div className='p-4 border-b border-neutral-200 dark:border-neutral-800'>
        <h1 className='text-xl font-bold text-neutral-900 dark:text-neutral-100'>
          Read Flow
        </h1>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {/* Library Section */}
        <div className='space-y-1 mb-4'>
          <div className='px-3 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider'>
            {librarySection.title}
          </div>
          {librarySection.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                )
              }
            >
              <item.icon size={16} />
              {item.title}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className='p-4'>
        <NavLink
          to={dashboardItem.href}
          className={cn(
            'inline-flex p-2 rounded-full text-sm font-medium transition-colors',
            'text-neutral-600  hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
          )}
        >
          <CircleGauge size={18} />
        </NavLink>
      </div>
    </Resizable>
  )
}
