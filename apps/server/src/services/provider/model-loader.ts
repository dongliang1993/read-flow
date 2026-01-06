import modelsDefault from '@read-flow/shared/data/models-config-v2'

import type { ModelConfigV2, ProviderConfigV2 } from '@read-flow/shared/types'

export default class ModelLoader {
  async load() {
    let modelConfigs: Record<string, ModelConfigV2> = {}
    let providerConfigs: Map<string, ProviderConfigV2> = new Map()

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
