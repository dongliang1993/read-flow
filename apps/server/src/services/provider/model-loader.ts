import modelsDefault from '@read-flow/shared/data/models-config'

import type { ModelsConfiguration } from '@read-flow/shared/types'

export default class ModelLoader {
  async load() {
    let serverConfig: ModelsConfiguration

    // Load server config
    try {
      serverConfig = modelsDefault as ModelsConfiguration
    } catch (error) {
      serverConfig = modelsDefault as ModelsConfiguration
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
