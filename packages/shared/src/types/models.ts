export interface ModelConfig {
  name: string
  imageInput?: boolean
  audioInput?: boolean
  imageOutput?: boolean
  providers: string[] // Will be validated against ProviderIds at runtime
  providerMappings?: Record<string, string>
  pricing?: { input: string; output: string }
  context_length?: number
}

export interface ModelCapability {
  vision?: boolean
  imageOutput?: boolean
  functionCalling?: boolean
  jsonMode?: boolean
  streaming?: boolean
  reasoning?: boolean
  contextWindow?: number
  maxOutputTokens?: number
}

export interface ModelConfigV2 {
  id: string
  name: string
  capabilities: ModelCapability | null
  enabled?: boolean
}

export interface ModelsConfiguration {
  version: string // ISO 8601 timestamp
  models: Record<string, ModelConfig>
}

export interface ModelVersionResponse {
  version: string // ISO 8601 timestamp
}

export type ModelKey = string
