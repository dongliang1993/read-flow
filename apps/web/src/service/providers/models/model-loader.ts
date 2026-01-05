import { env } from '@/config/env'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

export default class ModelLoader {
  async load(): Promise<ProviderConfigV2[]> {
    try {
      const response = await fetch(
        `${env.apiBaseUrl}/api/v1/settings/providers`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        throw new Error(`Failed to load providers: ${response.statusText}`)
      }

      const data = await response.json()
      return data.providers as ProviderConfigV2[]
    } catch (error) {
      console.warn('Failed to load provider settings:', error)
      return []
    }
  }

  async save(providers: ProviderConfigV2[]): Promise<boolean> {
    try {
      const response = await fetch(
        `${env.apiBaseUrl}/api/v1/settings/providers`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ providers }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to save providers: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Failed to save provider settings:', error)
      return false
    }
  }
}

export const modelLoader = new ModelLoader()
