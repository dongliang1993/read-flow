import { ArrowUp } from 'lucide-react'
import { useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { References } from './references'

import type { ChatStatus } from '@/hooks/use-chat'
import type { ChatReference } from '@read-flow/types'

type ChatInputProps = {
  value: string
  status: ChatStatus
  onChange: (value: string) => void
  onSubmit: (input: string) => void
  onStop: () => void
  references: ChatReference[]
  setReferences: (references: ChatReference[]) => void
}

export const ChatInput = ({
  value,
  status,
  onChange,
  onSubmit,
  onStop,
  references,
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

  console.log(status, 'status')

  return (
    <div className='relative border rounded-xl flex flex-col px-2 py-3'>
      {references.length > 0 && <References references={references} />}
      <Textarea
        value={value}
        onChange={handleValueChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        placeholder='Ask anything'
        className='border-none outline-none text-primary shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-28 max-h-60 pb-10 resize-none p-0'
        rows={1}
      />
      <div className='absolute bottom-2 right-2 w-full flex justify-end'>
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
