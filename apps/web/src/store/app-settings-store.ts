import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import { DEFAULT_BOOK_FONT, DEFAULT_BOOK_LAYOUT } from '@/constants/reader'

import type { SystemSettings } from '@/types/settings'

type AppSettingsState = {
  model: string
  settings: SystemSettings

  setSettings: (settings: SystemSettings) => void
  setModel: (model: string) => void
}

export const useAppSettingsStore = create<AppSettingsState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        model: '',
        settings: {
          globalViewSettings: {
            ...DEFAULT_BOOK_LAYOUT,
            ...DEFAULT_BOOK_FONT,
          },
        } as SystemSettings,
        setSettings: (settings: SystemSettings) => set({ settings }),

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
          model: state.model,
        }),
      }
    )
  )
)
