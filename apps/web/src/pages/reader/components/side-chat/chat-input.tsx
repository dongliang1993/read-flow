import { ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { References } from './references'
import { ModelSelector } from './model-selector'
import { env } from '@/config/env'

import type { ChatStatus } from '@/hooks/use-chat'
import type { ChatReference } from '@read-flow/shared'
import type { ModelConfig, ModelsConfig } from './model-selector'

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
  setReferences,
}: ChatInputProps) => {
  const [models, setModels] = useState<Record<string, ModelConfig>>({})
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [loadingModels, setLoadingModels] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoadingModels(true)
        const res = await fetch(`${env.apiBaseUrl}/api/v1/modes/configs`)
        if (!res.ok) return
        const json = (await res.json()) as ModelsConfig
        if (cancelled) return
        const nextModels = json?.models || {}
        setModels(nextModels)
        const firstId = Object.keys(nextModels)[0] || null
        setSelectedModelId((prev) => prev ?? firstId)
      } catch (error) {
      } finally {
        if (!cancelled) setLoadingModels(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasModels = useMemo(() => Object.keys(models).length > 0, [models])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
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
    <div className='relative border rounded-xl flex flex-col px-2 py-3'>
      {references.length > 0 && (
        <References references={references} onChange={setReferences} />
      )}
      <div className='mb-2 flex items-center justify-between'>
        <ModelSelector
          value={selectedModelId}
          models={models}
          onChange={setSelectedModelId}
          disabled={loadingModels || !hasModels}
        />
      </div>
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
