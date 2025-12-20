import { useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

export type PopupButtonProps = {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

type AnnotatorPopupProps = {
  buttons: PopupButtonProps[]
}

export const PopupButton = ({ label, icon, onClick }: PopupButtonProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center justify-center'>
            <button
              className='flex items-center justify-center cursor-pointer hover:bg-neutral-100 w-6 h-6 rounded px-1'
              onClick={onClick}
            >
              {icon}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent arrow={false} className='z-999'>
          <div className='flex items-center justify-center'>{label}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const AnnotatorPopup = ({ buttons }: AnnotatorPopupProps) => {
  return (
    <div className='flex items-center justify-center'>
      {buttons.map((button) => (
        <PopupButton {...button} />
      ))}
    </div>
  )
}
