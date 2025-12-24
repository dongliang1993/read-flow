import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, Calendar, TrendingUp } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { StatCard } from './components/stat-card'
import { ActivityHeatmap } from './components/activity-heatmap'
import { env } from '@/config/env'

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['reading-stats'],
    queryFn: async () => {
      const res = await fetch(`${env.apiBaseUrl}/api/v1/reading-stats`)
      if (!res.ok) throw new Error('Failed to fetch reading stats')
      return res.json()
    },
  })

  const { stats, heatmap } = data || { stats: {}, heatmap: [] }

  return (
    <div className='p-4 xl:px-12 space-y-8 h-full overflow-auto bg-background'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
          阅读统计
        </h1>
        <p className='text-neutral-500 mt-1'>查看您的阅读习惯和统计数据</p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='总阅读会话'
          value={isLoading ? '-' : stats.totalSessions || 0}
          description='累计阅读次数'
          icon={FileText}
        />
        <StatCard
          title='总阅读时长'
          value={
            isLoading ? '-' : formatDuration(stats.totalDurationSeconds || 0)
          }
          description='累计阅读小时数'
          icon={Clock}
        />
        <StatCard
          title='活跃天数'
          value={isLoading ? '-' : stats.activeDays || 0}
          description='有阅读记录的天数'
          icon={Calendar}
        />
        <StatCard
          title='平均每日会话'
          value={isLoading ? '-' : stats.avgSessionsPerDay || 0}
          description='活跃日平均会话数'
          icon={TrendingUp}
        />
      </div>

      {/* Heatmap */}
      <Card className='p-6'>
        <ActivityHeatmap data={heatmap} />
      </Card>
    </div>
  )
}
