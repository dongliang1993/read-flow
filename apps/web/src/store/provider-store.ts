import { create } from 'zustand'

import { modelLoader } from '@/service/providers/models/model-loader'
import { computeAvailableModels } from '@/service/providers/core/provider-utils'
import { useAppSettingsStore } from './app-settings-store'

import type { ProviderConfig, ModelConfig } from '@read-flow/shared/types'

export type ProviderFactory = (modelName: string) => any

type ProviderStoreState = {
  providers: ProviderConfig[]
  originalProviders: ProviderConfig[]
  availableModels: ModelConfig[]

  isInitialized: boolean
  isLoading: boolean
  isSaving: boolean
  isDirty: boolean
  error: string | null
}

type ProviderStoreActions = {
  initialize: () => Promise<void>
  refresh: () => Promise<void>
  updateProvider: (
    providerId: string,
    updates: Partial<Pick<ProviderConfig, 'apiKey' | 'baseURL' | 'enabled'>>
  ) => void
  updateModelEnabled: (
    providerId: string,
    modelId: string,
    enabled: boolean
  ) => void
  saveSettings: () => Promise<boolean>
  resetChanges: () => void
}

type ProviderStore = ProviderStoreState & ProviderStoreActions

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
  originalProviders: [],
  availableModels: [],
  isInitialized: false,
  isLoading: false,
  isSaving: false,
  isDirty: false,
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

      if (availableModels.length > 0) {
        setDefaultModel(availableModels[0].id, false)
      }

      set({
        availableModels,
        providers: modelsConfig,
        originalProviders: JSON.parse(JSON.stringify(modelsConfig)),
        isInitialized: true,
      })
    } catch (error) {
      console.error('[ProviderStore] Initialization failed:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ isLoading: false })
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null })

    try {
      const modelsConfig = await modelLoader.load()
      const availableModels = computeAvailableModels(modelsConfig)

      set({
        availableModels,
        providers: modelsConfig,
        originalProviders: JSON.parse(JSON.stringify(modelsConfig)),
        isDirty: false,
      })
    } catch (error) {
      console.error('[ProviderStore] Refresh failed:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ isLoading: false })
    }
  },

  updateProvider: (providerId, updates) => {
    set((state) => {
      const newProviders = state.providers.map((p) =>
        p.id === providerId ? { ...p, ...updates } : p
      )
      return {
        providers: newProviders,
        isDirty: true,
      }
    })
  },

  updateModelEnabled: (providerId, modelId, enabled) => {
    set((state) => {
      const newProviders = state.providers.map((p) => {
        if (p.id !== providerId) return p
        return {
          ...p,
          models: p.models.map((m) =>
            m.id === modelId ? { ...m, enabled } : m
          ),
        }
      })
      return {
        providers: newProviders,
        availableModels: computeAvailableModels(newProviders),
        isDirty: true,
      }
    })
  },

  saveSettings: async () => {
    const { providers } = get()
    set({ isSaving: true, error: null })

    try {
      const success = await modelLoader.save(providers)
      if (success) {
        set({
          originalProviders: JSON.parse(JSON.stringify(providers)),
          isDirty: false,
        })
      }
      return success
    } catch (error) {
      console.error('[ProviderStore] Save failed:', error)
      set({ error: error instanceof Error ? error.message : 'Save failed' })
      return false
    } finally {
      set({ isSaving: false })
    }
  },

  resetChanges: () => {
    set((state) => ({
      providers: JSON.parse(JSON.stringify(state.originalProviders)),
      availableModels: computeAvailableModels(state.originalProviders),
      isDirty: false,
    }))
  },
}))
