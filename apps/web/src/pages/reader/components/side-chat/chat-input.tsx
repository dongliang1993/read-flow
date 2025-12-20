import { ArrowUp } from 'lucide-react'
import { useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import type { ChatStatus } from '@/hooks/use-chat'

type ChatInputProps = {
  value: string
  status: ChatStatus
  onChange: (value: string) => void
  onSubmit: (input: string) => void
  onStop: () => void
}

export const ChatInput = ({
  value,
  status,
  onChange,
  onSubmit,
  onStop,
}: ChatInputProps) => {
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        onSubmit(value)
      }
    },
    [onSubmit, value]
  )

  const handleSubmit = useMemoizedFn(() => {
    if (status === 'ready') {
      void onSubmit(value)
    } else {
      onStop()
    }
  })

  const disabled = value.trim() === ''

  return (
    <div className='relative border rounded-md'>
      <Textarea
        value={value}
        onChange={handleValueChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        placeholder='Ask anything'
        className='border-none outline-none text-primary focus-visible:ring-0 focus-visible:ring-offset-0 h-30 max-h-60 pb-10 resize-none'
        rows={1}
      />
      <div className='absolute bottom-2 right-0 w-full flex justify-end px-2'>
        <Button
          type='submit'
          size='icon'
          className='size-7 cursor-pointer rounded-full'
          disabled={disabled}
          onClick={handleSubmit}
        >
          {status === 'ready' ? (
            <ArrowUp size={18} />
          ) : (
            <span className='size-2 rounded-xs bg-white dark:bg-neutral-700' />
          )}
        </Button>
      </div>
    </div>
  )
}
