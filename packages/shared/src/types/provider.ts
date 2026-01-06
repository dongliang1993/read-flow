import type { ModelConfig } from './models'

export type ProviderType =
  | 'openai'
  | 'anthropic'
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
  type: ProviderType
  models?: ModelConfig[]
  apiKey: string
  baseURL: string
  isResponseAPI?: boolean
  isCustom?: boolean
  enabled?: boolean
  createProvider?: (apiKey: string, baseUrl?: string) => any
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
