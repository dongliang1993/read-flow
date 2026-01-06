import { PROVIDER_CONFIGS } from '@read-flow/shared/providers/provider-config'

import type { ProviderConfig, ModelConfig } from '@read-flow/shared/types'

/**
 * Check if API key is configured for a provider
 */
export function hasApiKeyForProvider(
  providerId: string,
  apiKeys: Record<string, string | undefined>
): boolean {
  // Check regular API key
  const apiKey = apiKeys[providerId]
  return !!(apiKey && typeof apiKey === 'string' && apiKey.trim())
}

/**
 * Compute available models based on API keys and provider configs
 * Uses Map for O(1) deduplication to prevent duplicate entries when
 * the same model exists in both built-in MODEL_CONFIGS and customModels
 */
export function computeAvailableModels(
  providerConfigs: ProviderConfig[]
): ModelConfig[] {
  // Use Map for O(1) deduplication lookup - key is "${modelKey}-${providerId}"
  const modelMap = new Map<string, ModelConfig>()

  const availableProviders = providerConfigs.filter((provider) => {
    // Check built-in provider
    if (hasApiKeyForProvider(provider.id, { [provider.id]: provider.apiKey })) {
      return true
    }
  })

  // 1. Iterate through all built-in models (added first, so they take priority)
  for (const providerConfig of availableProviders) {
    if (!providerConfig) continue

    // Create a model entry for each available provider
    for (const model of providerConfig.models || []) {
      modelMap.set(model.id, model)
    }
  }

  // Sort by name and return
  return Array.from(modelMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
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
