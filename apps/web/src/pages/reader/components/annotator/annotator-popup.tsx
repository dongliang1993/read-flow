import {
  TooltipContent,
  TooltipTrigger,
  TooltipRoot,
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
    <TooltipRoot>
      <div className='flex items-center justify-center h-full hover:bg-neutral-100 rounded'>
        <TooltipTrigger asChild>
          <button
            className='flex items-center justify-center cursor-pointer w-6'
            onClick={onClick}
          >
            {icon}
          </button>
        </TooltipTrigger>
      </div>
      <TooltipContent arrow={false} className='z-9999'>
        <div className='flex items-center justify-center'>{label}</div>
      </TooltipContent>
    </TooltipRoot>
  )
}

export const AnnotatorPopup = ({ buttons }: AnnotatorPopupProps) => {
  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <div className='flex items-center justify-center gap-1.5 py-1 h-full'>
        {buttons.map((button) => (
          <>
            {button.dividerBefore && (
              <div className='w-px h-3 bg-neutral-200' />
            )}
            <PopupButton {...button} />
          </>
        ))}
      </div>
    </TooltipProvider>
  )
}
