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

export interface ModelConfig {
  id: string
  name: string
  capabilities?: ModelCapability | null
  enabled?: boolean
  pricing?: { input: string; output: string }
  context_length?: number
}

export interface ModelsConfiguration {
  version: string // ISO 8601 timestamp
  models: Record<string, ModelConfig>
}

export interface ModelVersionResponse {
  version: string // ISO 8601 timestamp
}

export type ModelKey = string
