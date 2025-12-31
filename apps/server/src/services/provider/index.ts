import {
  parseModelIdentifier,
  resolveProviderModelName,
  createProviders,
  buildProviderConfigs,
  type ProviderFactory,
} from '@read-flow/shared/providers/core/provider-utils'
import { PROVIDER_CONFIGS } from '@read-flow/shared/providers/provider-config'
import { ProviderRegistry } from '@read-flow/shared/providers/core/provider-registry'
import { modelLoader } from './model-loader'
import { env } from '../../config/env'
import { rawSettings } from '../../config/settings'
import type { ModelConfig } from '@read-flow/shared'

class ProviderService {
  private providerRegistry: ProviderRegistry
  private modelConfigs: Record<string, ModelConfig>
  private providers: Map<string, ProviderFactory>
  private apiKeys: Record<string, string | undefined>
  private baseUrls: Map<string, string>

  constructor() {
    this.providerRegistry = new ProviderRegistry()
    this.providers = new Map<string, ProviderFactory>()
    this.modelConfigs = {} as Record<string, ModelConfig>
    this.initialize()
  }

  async initialize() {
    const config = await modelLoader.load()
    this.modelConfigs = config.models

    const apiKeys = this.getApiKeys()
    const providerConfigs = buildProviderConfigs()
    const baseUrls = this.getBaseUrls()
    const providers = createProviders(apiKeys, providerConfigs, baseUrls)

    this.apiKeys = apiKeys
    this.baseUrls = baseUrls
    this.providers = providers
  }

  getApiKeys(): Record<string, string | undefined> {
    try {
      const allProviders = this.providerRegistry.getAllProviders()

      console.debug('[initialize] Loading API keys for providers', {
        providerCount: allProviders.length,
        providerIds: allProviders.map((p) => p.id),
      })

      // Parse API keys
      const apiKeys = {}
      for (const provider of allProviders) {
        const key = provider.id
        const rawSetting = rawSettings[provider.id as keyof typeof rawSettings]
        const value = rawSetting?.apiKey
        apiKeys[key] = value || undefined
      }

      return apiKeys
    } catch (error) {
      return {}
    }
  }

  getBaseUrls(): Map<string, string> {
    const providerIds = Object.keys(PROVIDER_CONFIGS)

    // Batch query all base URLs in a single database call
    const baseUrls = new Map<string, string>()
    for (const providerId of providerIds) {
      const baseUrl = env.openai.baseURL
      if (baseUrl) {
        baseUrls.set(providerId, baseUrl)
      }
    }

    return baseUrls
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
