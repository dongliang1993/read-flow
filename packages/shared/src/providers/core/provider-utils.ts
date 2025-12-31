import type { ModelConfig } from '../../types/models'
import type { ProviderConfig } from '../../types/provider'
import { PROVIDER_CONFIGS } from '../provider-config'

export type ProviderFactory = (modelName: string) => any

/**
 * Parse model identifier into modelKey and provider
 * Supports both formats:
 * - "modelKey@provider" (new format with explicit provider)
 * - "modelKey" (legacy format)
 */
export function parseModelIdentifier(modelIdentifier: string): {
  modelKey: string
  providerId: string | null
} {
  const parts = modelIdentifier.split('@')
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { modelKey: parts[0], providerId: parts[1] }
  }
  return { modelKey: modelIdentifier, providerId: null }
}

/**
 * Resolve the provider-specific model name
 * Some providers use different model names (e.g., "gpt-4" vs "gpt-4-turbo")
 */
export function resolveProviderModelName(
  modelConfigs: Record<string, ModelConfig>,
  modelKey: string,
  providerId: string
): string {
  const config = modelConfigs[modelKey as keyof typeof modelConfigs]
  return config?.providerMappings?.[providerId] || modelKey
}

/**
 * Create all provider factory instances based on API keys and configs
 */
export function createProviders(
  apiKeys: Record<string, string | undefined>,
  providerConfigs: Map<string, ProviderConfig>,
  baseUrls: Map<string, string>
): Map<string, ProviderFactory> {
  const providers = new Map<string, ProviderFactory>()

  for (const [providerId, providerDef] of providerConfigs) {
    let apiKey = apiKeys[providerId]

    // For custom providers, get API key from custom provider config
    if (providerDef.isCustom && providerDef.customConfig) {
      apiKey = providerDef.customConfig.apiKey
    }

    try {
      // Create provider using the definition's factory function
      if (providerDef.createProvider) {
        // Use custom base URL if set, otherwise use the default from provider definition
        let customBaseUrl = baseUrls.get(providerId)

        const baseUrl = customBaseUrl || providerDef.baseUrl
        const createdProvider = providerDef.createProvider(
          apiKey || '',
          baseUrl
        )
        providers.set(providerId, createdProvider)
      } else {
      }
    } catch (error) {}
  }

  return providers
}

/**
 * Build provider configs map from built-in and custom providers
 */
export function buildProviderConfigs(): Map<string, ProviderConfig> {
  const configs = new Map<string, ProviderConfig>()

  // Add built-in providers
  for (const [id, definition] of Object.entries(PROVIDER_CONFIGS)) {
    configs.set(id, definition)
  }

  return configs
}
