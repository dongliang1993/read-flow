import {
  CircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ReactNode } from 'react'
import type { ToolUIPart } from 'ai'

export const getStatusBadge = (status: ToolUIPart['state']) => {
  const labels: Record<ToolUIPart['state'], string> = {
    'input-streaming': 'Pending',
    'input-available': 'Running',
    'output-available': 'Completed',
    'output-error': 'Error',
  }

  const icons: Record<ToolUIPart['state'], ReactNode> = {
    'input-streaming': <CircleIcon className='size-3' />,
    'input-available': <ClockIcon className='size-3 animate-pulse' />,
    'output-available': <CheckCircleIcon className='size-3 text-green-600' />,
    'output-error': <XCircleIcon className='size-3 text-red-600' />,
  }

  return (
    <Badge
      className='flex items-center gap-1 rounded-full text-xs'
      variant='outline'
    >
      {icons[status]}
      <span>{labels[status]}</span>
    </Badge>
  )
}

/**
 * 格式化工具名称
 * @param type 工具类型
 * @returns 格式化后的工具名称
 */
export const formatToolName = (type: ToolUIPart['type']) => {
  // 以tool-开头，替换为空
  const toolName = type.replace('tool-', '')
  return toolName.charAt(0).toUpperCase() + toolName.slice(1)
}
