import type { ModelConfigV2 } from './models'

export type ProviderType =
  | 'openai'
  | 'openai-compatible'
  | 'custom'
  | 'custom-openai'
  | 'custom-anthropic'

export type CustomProviderType = 'openai-compatible' | 'anthropic'

export interface CustomProviderConfig {
  id: string
  name: string
  type: CustomProviderType
  baseUrl: string
  apiKey: string
  enabled: boolean
  description?: string
}

export interface ProviderConfig {
  id: string
  name: string
  apiKeyName: string
  baseUrl?: string
  required?: boolean
  type: ProviderType
  createProvider?: (apiKey: string, baseUrl?: string) => any
  isCustom?: boolean
  customConfig?: CustomProviderConfig
}

export interface ProviderConfigV2 {
  id: string
  name: string
  type: ProviderType
  models: ModelConfigV2[]
  apiKey: string
  baseURL: string
  apiVersion?: string
  isResponseAPI?: boolean
  enabled: boolean
}

export interface AvailableModel {
  key: string
  name: string
  provider: string
  providerName: string
  imageInput: boolean
  imageOutput: boolean
  audioInput: boolean
  inputPricing?: string
}

export interface ProviderRegistry {
  [key: string]: ProviderConfig
}
