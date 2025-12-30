import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

type ModelSelectorProps = {
  value: string | null
  models: Record<string, ModelConfig>
  onChange: (id: string) => void
  disabled?: boolean
}

export const ModelSelector = ({
  value,
  models,
  onChange,
  disabled,
}: ModelSelectorProps) => {
  const entries = Object.entries(models)
  const selected = value ? models[value] : null
  const label = selected?.name || '选择模型'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 px-2 text-neutral-200 hover:text-neutral-100 hover:bg-neutral-800'
          disabled={disabled}
        >
          <span className='max-w-[180px] truncate'>{label}</span>
          <ChevronDown className='ml-1 size-4 text-neutral-400' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-[240px]'>
        {entries.length === 0 ? (
          <DropdownMenuItem disabled>暂无可用模型</DropdownMenuItem>
        ) : (
          entries.map(([id, model]) => {
            const isSelected = id === value
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => onChange(id)}
                className='flex items-center justify-between gap-3'
              >
                <div className='min-w-0'>
                  <div className='truncate'>{model.name}</div>
                  <div className='text-xs text-neutral-400'>
                    context {model.context_length.toLocaleString()}
                    {model.imageInput ? ' · image' : ''}
                  </div>
                </div>
                {isSelected && <Check className='size-4 text-neutral-200' />}
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
