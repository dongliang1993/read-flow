import { useState, useMemo } from 'react'
import { Zap, Download, Search } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProviderIcon } from '@/components/provider-icon'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

type ProviderDetailProps = {
  provider: ProviderConfigV2
  onToggle?: (enabled: boolean) => void
  onBaseUrlChange?: (url: string) => void
  onFetchModels?: () => void
}

export const ProviderDetail = ({
  provider,
  onToggle,
  onBaseUrlChange,
  onFetchModels,
}: ProviderDetailProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const hasEnabledModels = provider.models?.some((m) => m.enabled)

  // 过滤并排序模型：启用的排前面，然后按搜索词过滤
  const filteredModels = useMemo(() => {
    const models = provider.models || []
    const query = searchQuery.toLowerCase().trim()

    // 先按 enabled 排序（启用的在前）
    const sorted = [...models].sort((a, b) => {
      if (a.enabled === b.enabled) return 0
      return a.enabled ? -1 : 1
    })

    // 如果没有搜索词，返回排序后的全部
    if (!query) return sorted

    // 按名称或 ID 过滤
    return sorted.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query)
    )
  }, [provider.models, searchQuery])

  return (
    <div className='flex-1 flex flex-col gap-6 border border-neutral-200 rounded-xl p-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <ProviderIcon provider={provider.type} className='size-8' />
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-xl font-semibold text-neutral-900'>
                {provider.name}
              </h2>
              {hasEnabledModels && (
                <span className='px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full'>
                  Active
                </span>
              )}
            </div>
            <p className='text-sm text-neutral-500 mt-0.5'>
              {getProviderDescription(provider.type)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='size-9'>
            <Zap className='size-4' />
          </Button>
          <Switch checked={hasEnabledModels} onCheckedChange={onToggle} />
        </div>
      </div>

      {/* Base URL */}
      <div>
        <label className='block text-sm font-medium text-neutral-900 mb-2'>
          Base URL (Optional)
        </label>
        <Input
          value={provider.baseURL || ''}
          onChange={(e) => onBaseUrlChange?.(e.target.value)}
          placeholder='Leave empty to use the default OpenAI API endpoint'
          className='bg-neutral-50 border-neutral-200'
        />
        <p className='text-xs text-neutral-500 mt-1.5'>
          Leave empty to use the default OpenAI API endpoint
        </p>
      </div>

      {/* Models Section */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sm font-medium text-neutral-900'>Models</span>
          <Button
            variant='outline'
            size='sm'
            onClick={onFetchModels}
            className='gap-1.5'
          >
            <Download className='size-4' />
            Fetch
          </Button>
        </div>

        {/* Search */}
        <div className='relative mb-3'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search models...'
            className='pl-9 bg-neutral-50 border-neutral-200'
          />
        </div>

        {/* Model count */}
        <p className='text-xs text-neutral-500 mb-3'>
          Showing {filteredModels.length} models (enabled first)
        </p>

        {/* Model list */}
        <div className='flex flex-col gap-2'>
          {filteredModels.map((model) => (
            <ModelItem
              key={model.id}
              name={model.name}
              modelId={model.id}
              enabled={model.enabled ?? false}
            />
          ))}
          {filteredModels.length === 0 && searchQuery && (
            <p className='text-sm text-neutral-400 text-center py-4'>
              No models found for "{searchQuery}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

type ModelItemProps = {
  name: string
  modelId: string
  enabled: boolean
  onToggle?: (enabled: boolean) => void
}

const ModelItem = ({ name, modelId, enabled, onToggle }: ModelItemProps) => {
  return (
    <div className='flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-xl'>
      <div className='flex flex-col'>
        <span className='text-sm font-medium text-neutral-900'>{name}</span>
        <span className='text-xs text-neutral-400 mt-0.5'>{modelId}</span>
      </div>
      <div className='flex items-center gap-2'>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  )
}

function getProviderDescription(type: string): string {
  switch (type) {
    case 'openai':
      return 'OpenAI GPT models including GPT-4 and GPT-3.5'
    case 'anthropic':
      return 'Anthropic Claude models'
    case 'google':
      return 'Google Gemini models'
    default:
      return 'AI language models'
  }
}
