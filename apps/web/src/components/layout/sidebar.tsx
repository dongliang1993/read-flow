import { NavLink } from 'react-router-dom'
import {
  Library,
  LayoutDashboard,
  Home,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function Sidebar() {
  const navItems = [
    {
      title: '主页',
      href: '/',
      icon: Home,
      exact: true,
    },
  ]

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

  const dashboardItem = {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  }

  return (
    <div className='w-64 h-screen bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-neutral-200 dark:border-neutral-800'>
        <h1 className='text-xl font-bold text-neutral-900 dark:text-neutral-100'>
          Read Flow
        </h1>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
        {/* Main Nav */}
        <div className='space-y-1 mb-4'>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                )
              }
            >
              <item.icon className='h-5 w-5' />
              {item.title}
            </NavLink>
          ))}
        </div>

        {/* Library Section */}
        <div className='space-y-1 mb-4'>
          <div className='px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider'>
            {librarySection.title}
          </div>
          {librarySection.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                )
              }
            >
              <item.icon className='h-5 w-5' />
              {item.title}
            </NavLink>
          ))}
        </div>

        {/* Dashboard */}
        <div className='space-y-1'>
          <NavLink
            to={dashboardItem.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
              )
            }
          >
            <dashboardItem.icon className='h-5 w-5' />
            {dashboardItem.title}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-neutral-200 dark:border-neutral-800'>
        <div className='text-xs text-neutral-500 dark:text-neutral-500'>
          © 2025 Read Flow
        </div>
      </div>
    </div>
  )
}
