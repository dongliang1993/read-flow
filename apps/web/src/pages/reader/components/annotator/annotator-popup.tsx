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
  dividerBefore?: boolean
}

type AnnotatorPopupProps = {
  buttons: PopupButtonProps[]
}

export const PopupButton = ({ label, icon, onClick }: PopupButtonProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center justify-center h-full'>
            <button
              className='flex items-center justify-center cursor-pointer hover:bg-neutral-100 w-6 rounded px-1 h-full'
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
    <div className='flex items-center justify-center gap-1.5 py-1 h-full'>
      {buttons.map((button) => (
        <>
          {button.dividerBefore && <div className='w-px h-3 bg-neutral-200' />}
          <PopupButton {...button} />
        </>
      ))}
    </div>
  )
}
