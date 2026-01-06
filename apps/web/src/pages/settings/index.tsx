import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Section, SectionTitle } from './components/section'
import { ProviderList } from './components/provider-list'
import { ProviderDetail } from './components/provider-detail'
import { Button } from '@/components/ui/button'

import { useProviderStore } from '@/store/provider-store'

import type { ProviderConfig } from '@read-flow/shared/types'

export function Settings() {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  )

  const providers = useProviderStore((state) => state.providers)
  const isDirty = useProviderStore((state) => state.isDirty)
  const isSaving = useProviderStore((state) => state.isSaving)
  const updateProvider = useProviderStore((state) => state.updateProvider)
  const updateModelEnabled = useProviderStore(
    (state) => state.updateModelEnabled
  )
  const saveSettings = useProviderStore((state) => state.saveSettings)
  const resetChanges = useProviderStore((state) => state.resetChanges)

  const selectedProvider =
    providers.find((p) => p.id === selectedProviderId) || null

  const handleProviderSelect = (provider: ProviderConfig) => {
    setSelectedProviderId(provider.id)
  }

  const handleApiKeyChange = (apiKey: string) => {
    if (selectedProviderId) {
      updateProvider(selectedProviderId, { apiKey })
    }
  }

  const handleBaseUrlChange = (baseURL: string) => {
    if (selectedProviderId) {
      updateProvider(selectedProviderId, { baseURL })
    }
  }

  const handleProviderToggle = (enabled: boolean) => {
    if (selectedProviderId) {
      updateProvider(selectedProviderId, { enabled })
    }
  }

  const handleModelToggle = (modelId: string, enabled: boolean) => {
    if (selectedProviderId) {
      updateModelEnabled(selectedProviderId, modelId, enabled)
    }
  }

  const handleSave = async () => {
    const success = await saveSettings()
    if (success) {
      toast.success('设置已保存')
    } else {
      toast.error('保存失败，请重试')
    }
  }

  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      setSelectedProviderId(providers[0].id)
    }
  }, [providers, selectedProviderId])

  return (
    <div className='min-h-screen bg-white flex flex-col p-6'>
      <header className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-neutral-900'>设置</h1>
        <div className='flex items-center gap-3'>
          {isDirty && (
            <Button
              variant='ghost'
              size='sm'
              className='cursor-pointer rounded-full h-8 px-4'
              onClick={resetChanges}
              disabled={isSaving}
            >
              取消
            </Button>
          )}
          <Button
            size='sm'
            className='cursor-pointer rounded-full h-8 px-4'
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving && <Loader2 className='size-4 mr-2 animate-spin' />}
            保存
          </Button>
        </div>
      </header>
      <main className='flex-1'>
        <Section>
          <SectionTitle>模型</SectionTitle>
          <div className='flex gap-8 h-[600px]'>
            <ProviderList
              providers={providers}
              selectedProvider={selectedProvider}
              onSelect={handleProviderSelect}
            />
            {selectedProvider && (
              <ProviderDetail
                provider={selectedProvider}
                onToggle={handleProviderToggle}
                onApiKeyChange={handleApiKeyChange}
                onBaseUrlChange={handleBaseUrlChange}
                onModelToggle={handleModelToggle}
              />
            )}
          </div>
        </Section>
      </main>
    </div>
  )
}
