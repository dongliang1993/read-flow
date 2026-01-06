import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { ProviderIcon } from '@/components/provider-icon'

import { cn } from '@/lib/utils'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { useProviderStore } from '@/store/provider-store'

import type { ModelConfigV2, ProviderConfigV2 } from '@read-flow/shared/types'

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
  className,
  model,
  active,
  onChange,
}: {
  model: ModelConfigV2
  active: boolean
  onChange: (model: ModelConfigV2) => void
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex items-center px-2 py-2 rounded-md cursor-pointer hover:bg-shade-03',
        className
      )}
      onClick={() => onChange(model)}
    >
      <div className='truncate text-sm text-foreground flex-1'>
        {model.name}
      </div>
      {active && <Check className='size-4' />}
    </div>
  )
}

const ProviderItem = ({
  className,
  provider,
  selectedModel,
  onChange,
}: {
  className?: string
  provider: ProviderConfigV2
  selectedModel: string
  onChange: (provider: ProviderConfigV2, model: ModelConfigV2) => void
}) => {
  const handleSelectModel = useCallback(
    (provider: ProviderConfigV2, model: ModelConfigV2) => {
      onChange(provider, model)
    },
    [onChange]
  )

  return (
    <div className={cn('flex flex-col px-1 py-2 rounded-md', className)}>
      <div className='flex items-center flex-1 py-1 px-1'>
        <ProviderIcon className='size-6' provider={provider.type} />
        <span className='ml-1 text-sm text-foreground'>{provider.name}</span>
      </div>
      <div className='flex flex-col'>
        {provider.models.map((model) => {
          const modelIdentifier = `${model.id}@${provider.type}`
          const active = modelIdentifier === selectedModel

          return (
            <ModelItem
              key={model.id}
              model={model}
              active={active}
              className='pl-8.5'
              onChange={(model) => handleSelectModel(provider, model)}
            />
          )
        })}
      </div>
    </div>
  )
}

export const ModelSelector = () => {
  const [open, setOpen] = useState(false)

  const model = useAppSettingsStore((state) => state.model)
  const setModel = useAppSettingsStore((state) => state.setModel)

  const isLoading = useProviderStore((state) => state.isLoading)
  const loadModels = useProviderStore((state) => state.initialize)
  const providers = useProviderStore((state) => state.providers)
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
    return availableModels.find((m) => m.id === currentModelKey)
  }, [availableModels, currentModelKey])

  // Handle model selection
  const handleSelectModel = useMemoizedFn(
    (provider: ProviderConfigV2, selectedModel: ModelConfigV2) => {
      debugger
      if (isLoading) {
        return
      }
      // Store as "modelKey@provider" format
      const modelIdentifier = `${selectedModel.id}@${provider.type}`
      setModel(modelIdentifier)
      setOpen(false)
    }
  )

  useEffect(() => {
    loadModels()
  }, [loadModels])

  console.log('currentModel', availableModels, currentModel)

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
        {providers.map((provider) => (
          <ProviderItem
            key={provider.id}
            provider={provider}
            selectedModel={model}
            onChange={handleSelectModel}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}
