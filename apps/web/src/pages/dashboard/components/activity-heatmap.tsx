import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

type HeatmapData = {
  date: string
  duration: number
  count: number
}

type ActivityHeatmapProps = {
  data: HeatmapData[]
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
]

const getColorLevel = (duration: number): string => {
  if (duration === 0) return 'bg-neutral-100 dark:bg-neutral-800'
  if (duration < 300) return 'bg-amber-100'
  if (duration < 900) return 'bg-amber-200'
  if (duration < 1800) return 'bg-amber-300'
  if (duration < 3600) return 'bg-amber-400'
  return 'bg-amber-500'
}

export const ActivityHeatmap = ({ data }: ActivityHeatmapProps) => {
  const { weeks, monthLabels, totalActiveDays, currentYear } = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()

    // 自然年：从1月1日开始
    const yearStart = new Date(currentYear, 0, 1)
    // 对齐到第一周的周日
    yearStart.setDate(yearStart.getDate() - yearStart.getDay())

    // 自然年：到12月31日结束
    const yearEnd = new Date(currentYear, 11, 31)

    const dataMap = new Map(data.map((d) => [d.date, d]))
    const weeks: {
      date: Date
      data: HeatmapData | null
      isCurrentYear: boolean
    }[][] = []
    const monthLabels: { month: number; weekIndex: number }[] = []

    let currentDate = new Date(yearStart)
    let currentWeek: {
      date: Date
      data: HeatmapData | null
      isCurrentYear: boolean
    }[] = []
    let lastMonth = -1

    while (currentDate <= yearEnd || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const month = currentDate.getMonth()
      const isCurrentYear = currentDate.getFullYear() === currentYear

      if (currentWeek.length === 0 && month !== lastMonth && isCurrentYear) {
        monthLabels.push({ month, weekIndex: weeks.length })
        lastMonth = month
      }

      currentWeek.push({
        date: new Date(currentDate),
        data: dataMap.get(dateStr) || null,
        isCurrentYear,
      })

      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
        if (currentDate > yearEnd) break
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    const totalActiveDays = data.filter((d) => d.duration > 0).length

    return { weeks, monthLabels, totalActiveDays, currentYear }
  }, [data])

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
          阅读活动热力图
        </h3>
        <p className='text-sm text-neutral-500'>
          {currentYear} 年阅读活动分布，颜色深浅表示当天的阅读强度
        </p>
      </div>

      <div className='overflow-x-auto'>
        <div className='inline-block min-w-max'>
          {/* 月份标签 */}
          <div className='flex text-xs text-neutral-500 mb-2 ml-10'>
            {monthLabels.map(({ month, weekIndex }, i) => (
              <span
                key={i}
                style={{
                  position: 'relative',
                  left: `${weekIndex * 22 - i * 40}px`,
                  marginRight: '18px',
                }}
              >
                {MONTHS[month]}
              </span>
            ))}
          </div>

          <div className='flex gap-1'>
            {/* 星期标签 */}
            <div className='flex flex-col gap-[3px] text-xs text-neutral-500 pr-2'>
              {WEEKDAYS.map((day, i) => (
                <div
                  key={i}
                  className='h-[18px] flex items-center justify-end w-6'
                >
                  {i % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* 热力图网格 */}
            <TooltipProvider delayDuration={100}>
              <div className='flex gap-[3px]'>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className='flex flex-col gap-[3px]'>
                    {week.map((day, dayIndex) => {
                      const duration = day.data?.duration || 0
                      const dateStr = day.date.toLocaleDateString('zh-CN')
                      const isCurrentYear = day.isCurrentYear

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[18px] h-[18px] ${
                                isCurrentYear
                                  ? getColorLevel(duration)
                                  : 'bg-transparent'
                              } hover:ring-1 hover:ring-neutral-400 cursor-pointer transition-all`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='font-medium'>{dateStr}</p>
                            <p className='text-xs'>
                              {duration > 0
                                ? `阅读 ${Math.round(duration / 60)} 分钟`
                                : '无阅读记录'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className='flex items-center justify-between text-xs text-neutral-500'>
        <div className='flex items-center gap-1'>
          <span>少</span>
          <div className='w-[18px] h-[18px] bg-neutral-100 dark:bg-neutral-800' />
          <div className='w-[18px] h-[18px] bg-amber-100' />
          <div className='w-[18px] h-[18px] bg-amber-200' />
          <div className='w-[18px] h-[18px] bg-amber-300' />
          <div className='w-[18px] h-[18px] bg-amber-400' />
          <div className='w-[18px] h-[18px] bg-amber-500' />
          <span>多</span>
        </div>
        <span>
          {currentYear} 年共阅读 {totalActiveDays} 天
        </span>
      </div>
    </div>
  )
}
