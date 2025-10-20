import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export type ProviderConfig = {
  providerId: string
  apiKey?: string
  baseUrl?: string
}

export function createProviderInstance(config: ProviderConfig) {
  const { providerId, apiKey, baseUrl } = config

  switch (providerId) {
    case 'gemini':
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: apiKey || 'https://generativelanguage.googleapis.com/v1beta',
        baseURL: baseUrl,
      })
    default:
      return createOpenAICompatible({
        apiKey: apiKey || '',
        baseURL: baseUrl || 'https://api.openai.com/v1',
        includeUsage: true,
        name: 'OpenAI Compatible',
      })
  }
}
