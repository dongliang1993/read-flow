import { env } from '@/config/env'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

export default class ModelLoader {
  async load() {
    let serverConfig: ProviderConfigV2[]

    // Load server config
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/v1/modes/configs`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to load models: ${response.statusText}`)
      }

      serverConfig = data as ProviderConfigV2[]
      console.log('models data', data)
    } catch (error) {
      serverConfig = []
      console.warn('Failed to load models cache file, using default:', error)
    }

    return serverConfig
  }
}

export const modelLoader = new ModelLoader()
