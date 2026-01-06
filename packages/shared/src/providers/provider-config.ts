import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { ProviderRegistry } from '../types'

export const PROVIDER_CONFIGS: ProviderRegistry = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    type: 'openai',
    createProvider: (apiKey: string, baseUrl?: string) => {
      return createOpenAI({
        baseURL: baseUrl || 'https://api.openai.com/v1',
        apiKey,
      })
    },
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    apiKey: '',
    baseURL: 'https://api.anthropic.com',
    type: 'anthropic',
    createProvider: (apiKey: string, baseUrl?: string) => {
      return createAnthropic({
        baseURL: baseUrl,
        apiKey,
      })
    },
  },
}

// Generate types from definitions
export type ProviderIds = keyof typeof PROVIDER_CONFIGS
export const PROVIDER_IDS = Object.keys(PROVIDER_CONFIGS) as ProviderIds[]
