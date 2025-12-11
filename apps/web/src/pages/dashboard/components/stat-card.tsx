import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) => {
  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <span className='text-sm text-neutral-500'>{title}</span>
        <Icon className='h-5 w-5 text-neutral-400' />
      </div>
      <div className='text-3xl font-bold text-neutral-900 dark:text-neutral-100'>
        {value}
      </div>
      <p className='text-sm text-neutral-500 mt-1'>{description}</p>
    </Card>
  )
}
