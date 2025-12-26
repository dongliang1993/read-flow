import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CircleGauge, LayoutDashboard } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

const dashboardItem = {
  title: '仪表盘',
  href: '/dashboard',
  icon: LayoutDashboard,
}

export function DashboardLink() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={dashboardItem.href}
          className={cn(
            'inline-flex p-2 rounded-full text-sm font-medium transition-colors',
            'text-neutral-600  hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
          )}
        >
          <CircleGauge size={18} />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent>{dashboardItem.title}</TooltipContent>
    </Tooltip>
  )
}
