import { cn } from '@/lib/utils'
import { ProviderIcon } from '@/components/provider-icon'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

type ProviderListProps = {
  providers: ProviderConfigV2[]
  selectedProvider: ProviderConfigV2 | null
  onSelect: (provider: ProviderConfigV2) => void
}

type ProviderItemProps = {
  provider: ProviderConfigV2
  isSelected: boolean
  onSelect: () => void
}

const ProviderItem = ({
  provider,
  isSelected,
  onSelect,
}: ProviderItemProps) => {
  const hasEnabled = provider.enabled

  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
        isSelected
          ? 'bg-neutral-100 border border-neutral-200'
          : 'hover:bg-neutral-50 border border-transparent'
      )}
    >
      <ProviderIcon provider={provider.type} className='size-6' />
      <span className='flex-1 text-sm font-medium text-neutral-900'>
        {provider.name}
      </span>
      <span
        className={cn(
          'size-2 rounded-full',
          hasEnabled ? 'bg-primary' : 'bg-neutral-300'
        )}
      />
    </button>
  )
}

export const ProviderList = ({
  providers,
  selectedProvider,
  onSelect,
}: ProviderListProps) => {
  return (
    <div className='flex flex-col gap-1 w-72 shrink-0'>
      {providers.map((provider) => (
        <ProviderItem
          key={provider.id}
          provider={provider}
          isSelected={selectedProvider?.id === provider.id}
          onSelect={() => onSelect(provider)}
        />
      ))}
    </div>
  )
}
