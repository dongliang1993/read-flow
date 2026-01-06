import type { ModelConfig } from '../../types/models'
import type { ProviderConfig } from '../../types/provider'
import { PROVIDER_CONFIGS } from '../provider-config'
import type { ProviderConfigV2 } from '../../types/provider'

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
  modelKey: string,
  providerId: string
): string {
  const providerMappings: Record<string, Record<string, string>> = {
    openai: {
      'gpt-4': 'gpt-4-turbo',
      'gpt-4-turbo': 'gpt-4-turbo',
    },
    anthropic: {
      'claude-opus-4.5': 'claude-opus-4-5-20251101',
    },
  }

  return providerMappings[providerId]?.[modelKey] || modelKey
}

/**
 * Create all provider factory instances based on API keys and configs
 */
export function createProviders(
  providerConfigs: Map<string, ProviderConfigV2>
): Map<string, ProviderFactory> {
  const providers = new Map<string, ProviderFactory>()

  for (const [providerId, providerDef] of providerConfigs) {
    let apiKey = providerDef.apiKey

    try {
      // Create provider using the definition's factory function
      // Use custom base URL if set, otherwise use the default from provider definition
      const baseUrl = providerDef.baseURL
      const createProvider = PROVIDER_CONFIGS[providerDef.type].createProvider

      if (!createProvider) {
        throw new Error(`Provider ${providerDef.type} createProvider not found`)
      }

      const createdProvider = createProvider(apiKey, baseUrl)
      providers.set(providerId, createdProvider)
    } catch (error) {
      throw new Error(`Failed to create provider ${providerId}: ${error}`)
    }
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
