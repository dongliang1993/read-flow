import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { useProviderStore } from '@/store/provider-store'

import type { AvailableModel } from '@read-flow/shared/types'

export type ModelPricing = {
  input: string
  output: string
  cachedInput?: string
}

export type ModelConfig = {
  name: string
  imageInput: boolean
  providerMappings: Record<string, string>
  pricing: ModelPricing
  context_length: number
}

export type ModelsConfig = {
  models: Record<string, ModelConfig>
}

const ModelItem = ({
  model,
  active,
  onChange,
}: {
  model: AvailableModel
  active: boolean
  onChange: (model: AvailableModel) => void
}) => {
  return (
    <div
      className='flex items-center px-2 py-2 mx-2 rounded-md cursor-pointer hover:bg-shade-03'
      onClick={() => onChange(model)}
    >
      <div className='truncate text-sm text-foreground flex-1'>
        {model.name}
      </div>
      {active && <Check className='size-4' />}
    </div>
  )
}

export const ModelSelector = () => {
  const [open, setOpen] = useState(false)

  const model = useAppSettingsStore((state) => state.model)
  const setModel = useAppSettingsStore((state) => state.setModel)

  const isLoading = useProviderStore((state) => state.isLoading)
  const loadModels = useProviderStore((state) => state.initialize)
  const availableModels = useProviderStore((state) => state.availableModels)

  const currentModelKey = useMemo(() => {
    if (!model) {
      return ''
    }
    const parts = model.split('@')
    return parts[0] || ''
  }, [model])

  // Find current model info
  const currentModel = useMemo(() => {
    return availableModels.find((m) => m.key === currentModelKey)
  }, [availableModels, currentModelKey])

  // Handle model selection
  const handleSelectModel = useCallback(
    (model: AvailableModel) => {
      if (isLoading) {
        return
      }
      // Store as "modelKey@provider" format
      const modelIdentifier = `${model.key}@${model.provider}`
      setModel(modelIdentifier)
      setOpen(false)
    },
    [isLoading, setModel]
  )

  useEffect(() => {
    loadModels()
  }, [loadModels])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={isLoading}
          className='h-7 px-3 text-sm rounded-full cursor-pointer hover:bg-neutral-100 '
        >
          <span className='max-w-[180px] truncate text-foreground'>
            {currentModel?.name}
          </span>
          <ChevronDown className='ml-1 size-4 text-neutral-400' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[280px] overflow-y-auto max-h-[400px] px-0 py-1 shadow-lg outline-none rounded-2xl border border-neutral-50'
      >
        {availableModels.map((model) => {
          const isSelected = model.key === currentModelKey

          return (
            <ModelItem
              key={model.key}
              model={model}
              active={isSelected}
              onChange={handleSelectModel}
            />
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
