import { create } from 'zustand'

import { modelLoader } from '@/service/providers/models/model-loader'
import { computeAvailableModels } from '@/service/providers/core/provider-utils'
import { useAppSettingsStore } from './app-settings-store'

import type { ProviderConfigV2, ModelConfigV2 } from '@read-flow/shared/types'

export type ProviderFactory = (modelName: string) => any

type ProviderStoreState = {
  providers: ProviderConfigV2[]
  availableModels: ModelConfigV2[]

  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

type ProviderStoreActions = {
  initialize: () => Promise<void>
}

type ProviderStore = ProviderStoreState & ProviderStoreActions

/**
 *
 * @param model
 * @param override 是否覆盖默认模型
 * @returns
 */
function setDefaultModel(model: string, override: boolean = false) {
  const setModel = useAppSettingsStore.getState().setModel
  const initModel = useAppSettingsStore.getState().model

  if (initModel && !override) {
    return
  }

  setModel(model)
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: [],
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
      const modelsConfig = await modelLoader.load()
      const availableModels = computeAvailableModels(modelsConfig)

      setDefaultModel(availableModels[0].id, false)
      set({ availableModels, providers: modelsConfig })
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
