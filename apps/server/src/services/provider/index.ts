import {
  parseModelIdentifier,
  resolveProviderModelName,
  createProviders,
  type ProviderFactory,
} from '@read-flow/shared/providers/core/provider-utils'
import { modelLoader } from './model-loader'
import type { ModelConfig } from '@read-flow/shared'

class ProviderService {
  private modelConfigs: Record<string, ModelConfig>
  private providers: Map<string, ProviderFactory>

  constructor() {
    this.providers = new Map<string, ProviderFactory>()
    this.modelConfigs = {} as Record<string, ModelConfig>
    this.initialize()
  }

  async initialize() {
    const { modelConfigs, providerConfigs } = await modelLoader.load()
    this.modelConfigs = modelConfigs!

    const providers = createProviders(providerConfigs!)
    this.providers = providers

    console.log('providers', this.providers)
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
}

export const providerService = new ProviderService()
