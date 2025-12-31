import { createOpenAI } from '@ai-sdk/openai'
import type { ProviderRegistry } from '../types'

export const PROVIDER_CONFIGS: ProviderRegistry = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiKeyName: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    required: false,
    type: 'openai',
    createProvider: (apiKey: string, baseUrl?: string) => {
      return createOpenAI({
        baseURL: baseUrl || 'https://api.openai.com/v1',
        apiKey,
      })
    },
  },
}

// Generate types from definitions
export type ProviderIds = keyof typeof PROVIDER_CONFIGS
export const PROVIDER_IDS = Object.keys(PROVIDER_CONFIGS) as ProviderIds[]
