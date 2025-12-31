import modelsDefault from '@read-flow/shared/data/models-config'
import { env } from '@/config/env'

import type { ModelsConfiguration } from '@read-flow/shared/types'

export default class ModelLoader {
  async load() {
    let serverConfig: ModelsConfiguration

    // Load server config
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/v1/modes/configs`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to load models: ${response.statusText}`)
      }

      serverConfig = data as ModelsConfiguration
      console.log('models data', data)
    } catch (error) {
      serverConfig = modelsDefault as ModelsConfiguration
      console.warn('Failed to load models cache file, using default:', error)
    }

    // Merge configs (custom models take precedence)
    const mergedConfig: ModelsConfiguration = {
      version: serverConfig.version,
      models: {
        ...serverConfig.models,
      },
    }

    return mergedConfig
  }
}

export const modelLoader = new ModelLoader()
