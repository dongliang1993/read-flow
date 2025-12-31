import { create } from 'zustand'

import { ensureModelsInitialized } from '@/service/providers/config/model-config'
import {
  computeAvailableModels,
  buildProviderConfigs,
} from '@/service/providers/core/provider-utils'

import type { AvailableModel, ProviderConfig } from '@read-flow/shared/types'

export type ProviderFactory = (modelName: string) => any

type ProviderStoreState = {
  providers: Map<string, ProviderFactory>
  // Provider configurations (built-in + custom)
  providerConfigs: Map<string, ProviderConfig>

  availableModels: AvailableModel[]

  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

type ProviderStoreActions = {
  initialize: () => Promise<void>
}

type ProviderStore = ProviderStoreState & ProviderStoreActions

async function loadApiKeys(): Promise<Record<string, string | undefined>> {
  const { useAppSettingsStore } = await import('@/store/app-settings-store')
  return useAppSettingsStore.getState().getApiKeys()
}

async function setDefaultModel(firstModel: AvailableModel) {
  const { useAppSettingsStore } = await import('@/store/app-settings-store')
  const setModel = useAppSettingsStore.getState().setModel
  const model = useAppSettingsStore.getState().model

  if (model) {
    return
  }

  setModel(`${firstModel.key}@${firstModel.provider}`)
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: new Map(),
  providerConfigs: new Map(),
  availableModels: [],
  isInitialized: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const { isInitialized, isLoading } = get()

    if (isInitialized || isLoading) {
      console.debug('[ProviderStore] Already initialized or loading, skipping')
      return
    }

    set({ isLoading: true, error: null })

    try {
      await ensureModelsInitialized()
      const [apiKeys] = await Promise.all([loadApiKeys()])

      // Build provider configs (built-in + custom)
      const providerConfigs = buildProviderConfigs()
      const availableModels = computeAvailableModels(apiKeys, providerConfigs)
      await setDefaultModel(availableModels[0])
      set({ availableModels })
      console.info('[ProviderStore] Starting initialization...', {
        availableModels,
      })
    } catch (error) {
      console.error('[ProviderStore] Initialization failed:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
