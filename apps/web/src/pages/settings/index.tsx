import { useEffect, useState } from 'react'

import { Section, SectionTitle } from './components/section'
import { ProviderList } from './components/provider-list'
import { ProviderDetail } from './components/provider-detail'

import { useProviderStore } from '@/store/provider-store'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

export function Settings() {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderConfigV2 | null>(null)

  const providers = useProviderStore((state) => state.providers)

  const handleProviderSelect = (provider: ProviderConfigV2) => {
    setSelectedProvider(provider)
  }

  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0])
    }
  }, [providers, selectedProvider])

  return (
    <div className='min-h-screen bg-white flex flex-col p-6'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold text-neutral-900'>设置</h1>
      </header>
      <main className='flex-1'>
        <Section>
          <SectionTitle>模型</SectionTitle>
          <div className='flex gap-8'>
            <ProviderList
              providers={providers}
              selectedProvider={selectedProvider}
              onSelect={handleProviderSelect}
            />
            {selectedProvider && <ProviderDetail provider={selectedProvider} />}
          </div>
        </Section>
      </main>
    </div>
  )
}
