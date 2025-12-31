import { PROVIDER_CONFIGS } from '@read-flow/shared/providers/provider-config'
import {
  MODEL_CONFIGS,
  getProvidersForModel,
} from '@/service/providers/config/model-config'

import type { ProviderConfig, AvailableModel } from '@read-flow/shared/types'

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
  apiKeys: Record<string, string | undefined>,
  _providerConfigs: Map<string, ProviderConfig>
): AvailableModel[] {
  // Use Map for O(1) deduplication lookup - key is "${modelKey}-${providerId}"
  const modelMap = new Map<string, AvailableModel>()

  // Helper to add model only if not already exists (built-in models take priority)
  const addModel = (model: AvailableModel) => {
    const key = `${model.key}-${model.provider}`
    if (!modelMap.has(key)) {
      modelMap.set(key, model)
    }
  }

  // 1. Iterate through all built-in models (added first, so they take priority)
  for (const [modelKey, modelConfig] of Object.entries(MODEL_CONFIGS)) {
    if (!modelConfig) continue

    // Find all available providers for this model
    const providers = getProvidersForModel(modelKey)
    const availableProviders = providers.filter((provider) => {
      // Check built-in provider
      if (hasApiKeyForProvider(provider.id, apiKeys)) {
        return true
      }
    })

    // Create a model entry for each available provider
    for (const provider of availableProviders) {
      addModel({
        key: modelKey,
        name: modelConfig.name,
        provider: provider.id,
        providerName: provider.name,
        imageInput: modelConfig.imageInput ?? false,
        imageOutput: modelConfig.imageOutput ?? false,
        audioInput: modelConfig.audioInput ?? false,
        inputPricing: modelConfig.pricing?.input,
      })
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
