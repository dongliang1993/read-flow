import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import { DEFAULT_BOOK_FONT, DEFAULT_BOOK_LAYOUT } from '@/constants/reader'
import { providerRegistry } from '@/service/providers/core/provider-registry'

import type { SystemSettings } from '@/types/settings'
import type { ApiKeySettings } from '@/types/api-key'

type AppSettingsState = {
  apiKeys: ApiKeySettings
  model: string
  settings: SystemSettings

  initialize: () => Promise<void>
  setSettings: (settings: SystemSettings) => void
  getApiKeys: () => ApiKeySettings
  setModel: (model: string) => void
}

export const useAppSettingsStore = create<AppSettingsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        apiKeys: {} as ApiKeySettings,
        model: '',
        settings: {
          globalViewSettings: {
            ...DEFAULT_BOOK_LAYOUT,
            ...DEFAULT_BOOK_FONT,
          },
        } as SystemSettings,
        setSettings: (settings: SystemSettings) => set({ settings }),

        initialize: async () => {
          try {
            const allProviders = providerRegistry.getAllProviders()

            console.debug('[initialize] Loading API keys for providers', {
              providerCount: allProviders.length,
              providerIds: allProviders.map((p) => p.id),
            })

            // Parse API keys
            const apiKeys: Partial<ApiKeySettings> = {}
            for (const provider of allProviders) {
              const key = provider.id as keyof ApiKeySettings
              const value = provider.baseUrl
              apiKeys[key] = value || undefined
            }

            set({ apiKeys })
          } catch (error) {}
        },

        getApiKeys: () => {
          return get().apiKeys
        },

        // Model Type Settings
        setModel: async (value: string) => {
          set({ model: value } as Partial<AppSettingsState>)
        },
      }),
      {
        name: '__READ_FLOW_APP_SETTINGS__',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          settings: state.settings,
        }),
      }
    )
  )
)
