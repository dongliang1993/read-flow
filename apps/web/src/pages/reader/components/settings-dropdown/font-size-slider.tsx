import * as Slider from '@radix-ui/react-slider'
import { useState, useCallback, useEffect } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type FontSizeSliderProps = {
  value: number[]
  min: number
  max: number
  step: number
  className?: string
  showTooltip?: boolean
  onValueChange?: (newValue: number[]) => void
  tooltipContent?: (value: number) => React.ReactNode
}

export const FontSizeSlider = ({
  value,
  min,
  max,
  step,
  className,
  showTooltip = false,
  onValueChange,
  tooltipContent,
}: FontSizeSliderProps) => {
  const [showTooltipState, setShowTooltipState] = useState(false)

  const handleValueChange = useCallback(
    (newValue: number[]) => {
      onValueChange?.(newValue)
    },
    [onValueChange]
  )

  const handlePointerDown = useCallback(() => {
    if (showTooltip) {
      setShowTooltipState(true)
    }
  }, [showTooltip])

  const handlePointerUp = useCallback(() => {
    if (showTooltip) {
      setShowTooltipState(false)
    }
  }, [showTooltip])

  const renderThumb = () => {
    const thumb = (
      <Slider.Thumb
        className='block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline-[3px] focus-visible:outline-ring/40 data-[disabled]:cursor-not-allowed'
        onPointerDown={handlePointerDown}
      />
    )

    if (!showTooltip) return thumb

    return (
      <TooltipProvider>
        <Tooltip open={showTooltipState}>
          <TooltipTrigger asChild>{thumb}</TooltipTrigger>
          <TooltipContent
            className='px-2 py-1 text-xs'
            sideOffset={8}
            side={'top'}
          >
            <p>{tooltipContent ? tooltipContent(value[0]!) : value[0]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  useEffect(() => {
    if (showTooltip) {
      document.addEventListener('pointerup', handlePointerUp)
      return () => {
        document.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [showTooltip, handlePointerUp])

  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      onValueChange={handleValueChange}
    >
      <Slider.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-muted'>
        <Slider.Range className='absolute h-full bg-primary' />
      </Slider.Track>
      {renderThumb()}
    </Slider.Root>
  )
}
