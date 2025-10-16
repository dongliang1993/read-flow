import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings2, Minus, Plus } from 'lucide-react'

type SettingsDropdownProps = {
  fontSize: number
  decreaseFontSize: () => void
  increaseFontSize: () => void
}

const SettingsDropdown = ({
  fontSize,
  decreaseFontSize,
  increaseFontSize,
}: SettingsDropdownProps) => {
  const [open, setOpen] = useState(false)

  const handleToggleSettingsDropdown = () => {
    setOpen(!open)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleToggleSettingsDropdown}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <Settings2 className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={decreaseFontSize}
              disabled={fontSize <= 50}
            >
              <Minus className='h-3.5 w-3.5' />
            </Button>
            <span className='text-xs font-medium text-neutral-700 dark:text-neutral-300 min-w-10 text-center'>
              大
            </span>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={increaseFontSize}
              disabled={fontSize >= 200}
            >
              <Plus className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SettingsDropdown
