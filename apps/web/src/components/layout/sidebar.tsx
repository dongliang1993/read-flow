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

import type { LucideProps } from 'lucide-react'

const dashboardItem = {
  title: '仪表盘',
  href: '/dashboard',
  icon: LayoutDashboard,
}

const librarySection = {
  title: 'Library',
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

type NavItemProps = {
  href: string
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  title: string
}

const NavItem = ({ href, icon, title }: NavItemProps) => {
  const Icon = icon

  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 p-1 rounded-xl text-sm font-medium transition-colors border',
          isActive
            ? 'bg-shade-03 text-neutral-900 border border-shade-04'
            : 'text-neutral-600 hover:bg-shade-03 border-transparent'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              'size-8 flex items-center justify-center rounded-md',
              isActive ? 'bg-shade-01 shadow-sm' : ''
            )}
          >
            <Icon size={16} />
          </div>
          {title}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const [width, setWidth] = useState(260)

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
      className='h-screen bg-shade-01 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col'
    >
      {/* Header */}
      <div className='p-4'>
        <h1 className='text-xl font-bold text-neutral-900'>Read Flow</h1>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {/* Library Section */}
        <div className='space-y-1 mb-4'>
          <div className='px-3 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-500 tracking-wider'>
            {librarySection.title}
          </div>
          {librarySection.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
            />
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
