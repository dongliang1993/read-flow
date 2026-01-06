import { useState } from 'react'
import {
  CircleCheck,
  Circle,
  CircleDotDashed,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type PlanStep = {
  id: string
  description: string
  tool?: string
  status: 'pending' | 'running' | 'completed' | 'error'
}

type StepUpdate = {
  stepId: string
  status: 'running' | 'completed' | 'error'
  result?: string
}

type PlanOutput = {
  planId: string
  title: string
  description: string
  steps: PlanStep[]
  createdAt: string
}

type PlanStepsProps = {
  output: PlanOutput
  stepUpdates?: StepUpdate[]
}

const statusIcons = {
  pending: <Circle className='size-4 text-neutral-400' />,
  running: <CircleDotDashed className='size-4 text-neutral-500 animate-spin' />,
  completed: <CircleCheck className='size-4 text-green-500' />,
  error: <XCircle className='size-4 text-red-500' />,
}

const VISIBLE_STEPS = 4

export const PlanSteps = ({ output, stepUpdates = [] }: PlanStepsProps) => {
  const { title, description, steps } = output
  const [showAll, setShowAll] = useState(false)

  const getStepStatus = (
    step: PlanStep
  ): { status: PlanStep['status']; result?: string } => {
    const update = stepUpdates.find((u) => u.stepId === step.id)
    if (update) {
      return { status: update.status, result: update.result }
    }
    return { status: step.status }
  }

  const stepsWithStatus = steps.map((step) => {
    const { status, result } = getStepStatus(step)
    return {
      ...step,
      computedStatus: status,
      result,
    }
  })

  const completedCount = stepsWithStatus.filter(
    (s) => s.computedStatus === 'completed'
  ).length
  const totalCount = steps.length
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const visibleSteps = showAll
    ? stepsWithStatus
    : stepsWithStatus.slice(0, VISIBLE_STEPS)
  const hiddenCount = steps.length - VISIBLE_STEPS

  return (
    <div className='space-y-4 p-4'>
      <div className='space-y-1'>
        <div className='text-base font-semibold text-neutral-900'>{title}</div>
        {description && (
          <div className='text-sm text-neutral-500'>{description}</div>
        )}
      </div>

      <div className='space-y-2'>
        <div className='text-sm text-neutral-500'>
          {completedCount} of {totalCount} complete
        </div>
        <div className='h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden'>
          <div
            className='h-full bg-primary rounded-full transition-all duration-300'
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className='space-y-1'>
        {visibleSteps.map((step) => {
          return (
            <Collapsible key={step.id}>
              <CollapsibleTrigger className='flex w-full items-center justify-between gap-2 rounded-md p-2 hover:bg-neutral-50 transition-colors group'>
                <div className={cn('flex items-center gap-2 min-w-0')}>
                  <span className='shrink-0'>
                    {statusIcons[step.computedStatus]}
                  </span>
                  <span
                    className={cn(
                      'text-sm truncate',
                      step.computedStatus === 'completed' &&
                        'text-neutral-500 line-through',
                      step.computedStatus === 'running' && 'text-neutral-800',
                      step.computedStatus === 'pending' && 'text-primary',
                      step.computedStatus === 'error' && 'text-red-600'
                    )}
                  >
                    {step.description}
                  </span>
                </div>
                <ChevronDown className='size-4 text-neutral-400 shrink-0 transition-transform group-data-[state=open]:rotate-180' />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='pl-8 pr-2 pb-2 text-sm text-neutral-500'>
                  {step.result || (step.tool && `Using ${step.tool}`)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className='flex items-center gap-2 p-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors'
          >
            <span className='text-neutral-400'>···</span>
            <span>{hiddenCount} more</span>
          </button>
        )}

        {showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(false)}
            className='flex items-center gap-2 p-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors'
          >
            <span>Show less</span>
          </button>
        )}
      </div>
    </div>
  )
}
