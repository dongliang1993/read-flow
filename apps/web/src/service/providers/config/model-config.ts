import type {
  ModelConfig as ModelConfigType,
  ProviderConfig,
} from '@read-flow/shared/types'
import { providerRegistry } from '@/service/providers/core/provider-registry'
import { modelLoader } from '@/service/providers/models/model-loader'

export let MODEL_CONFIGS: Record<string, ModelConfigType> = {}

// Promise to track initialization status
let initPromise: Promise<void> | null = null

// Initialize models from loader
async function initializeModels() {
  try {
    const config = await modelLoader.load()
    MODEL_CONFIGS = config.models
  } catch (error) {
    console.error('Failed to load models:', error)
    // Fallback to empty object - will use default configs
    MODEL_CONFIGS = {}
  }
}

/**
 * Ensure models are initialized before use
 * Call this before accessing MODEL_CONFIGS to avoid race conditions
 */
export function ensureModelsInitialized() {
  if (!initPromise) {
    initPromise = initializeModels()
  }

  return initPromise
}

// Initialize on module load
initPromise = initializeModels()

export type ModelKey = string

export function getProvidersForModel(model: string): ProviderConfig[] {
  const modelKey = model.split('@')[0] || model
  const config = MODEL_CONFIGS[modelKey as ModelKey]
  if (!config || !config.providers) return []
  return config.providers
    .map((id) => providerRegistry.getProvider(String(id)))
    .filter((p) => p !== undefined) as ProviderConfig[]
}
