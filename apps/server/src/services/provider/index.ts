import {
  parseModelIdentifier,
  resolveProviderModelName,
  createProviders,
  type ProviderFactory,
} from '@read-flow/shared/providers/core/provider-utils'
import modelsDefault from '@read-flow/shared/data/models-config'

import type { ModelConfig, ProviderConfig } from '@read-flow/shared'

class ProviderService {
  private modelConfigs: Record<string, ModelConfig>
  private providers: Map<string, ProviderFactory>
  private providerConfigs: Map<string, ProviderConfig>

  constructor() {
    this.providers = new Map<string, ProviderFactory>()
    this.providerConfigs = new Map<string, ProviderConfig>()
    this.modelConfigs = {} as Record<string, ModelConfig>

    this.initialize()
  }

  async initialize() {
    let modelConfigs: Record<string, ModelConfig> = {}
    let providerConfigs: Map<string, ProviderConfig> = new Map()

    for (const provider of modelsDefault) {
      providerConfigs.set(provider.id, provider as ProviderConfig)

      for (const model of provider.models) {
        modelConfigs[model.id] = model
      }
    }

    this.modelConfigs = modelConfigs
    this.providers = createProviders(providerConfigs)
    this.providerConfigs = providerConfigs
  }

  // Get provider model instance (synchronous - main API for LLM service)
  getProviderModel(modelIdentifier: string) {
    const { modelKey, providerId } = parseModelIdentifier(modelIdentifier)

    if (!providerId) {
      throw new Error(
        `No available provider for model: ${modelKey}. Please configure API keys in settings.`
      )
    }

    const provider = this.providers.get(providerId)

    if (!provider) {
      throw new Error(
        `Provider ${providerId} not initialized for model: ${modelKey}`
      )
    }

    const providerModelName = resolveProviderModelName(
      this.modelConfigs,
      modelKey,
      providerId
    )

    return provider(providerModelName)
  }

  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providerConfigs.values())
  }
}

export const providerService = new ProviderService()
