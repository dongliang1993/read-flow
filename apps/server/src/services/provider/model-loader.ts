import modelsDefault from '@read-flow/shared/data/models-config'

import type { ModelConfig, ProviderConfig } from '@read-flow/shared/types'

export default class ModelLoader {
  async load() {
    let modelConfigs: Record<string, ModelConfig> = {}
    let providerConfigs: Map<string, ProviderConfig> = new Map()

    // Load server config
    try {
      for (const provider of modelsDefault) {
        if (!provider.enabled) {
          continue
        }

        providerConfigs.set(provider.id, provider)

        for (const model of provider.models) {
          if (!model.enabled) {
            continue
          }

          modelConfigs[model.id] = model
        }
      }
    } catch (error) {
      console.error('Failed to load model config:', error)
      return {}
    }

    return { modelConfigs, providerConfigs }
  }
}

export const modelLoader = new ModelLoader()
