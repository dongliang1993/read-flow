import { createOpenAI } from '@ai-sdk/openai'
import modelsConfigV2 from '@read-flow/shared/data/models-config-v2'

import { env } from '../config/env'

import type { ProviderConfigV2 } from '@read-flow/shared/types'

const openai = createOpenAI({
  apiKey: env.openai.apiKey,
  baseURL: env.openai.baseURL,
  headers: {
    Authorization: `Bearer ${env.openai.apiKey}`,
  },
})

export type ModelConfig = {
  name: string
  imageInput?: boolean
  audioInput?: boolean
  imageOutput?: boolean
  pricing?: { input: string; output: string }
}

export type ModelsConfiguration = {
  models: Record<string, ModelConfig>
}

type Models = {
  openai: typeof openai
}

type ModelName = keyof Models

export class ModelsService {
  private models: Models = {} as Models

  constructor() {
    this.models = {
      openai,
    }
  }

  getConfigs(): ProviderConfigV2[] {
    return modelsConfigV2 as ProviderConfigV2[]
  }

  getModel(model: ModelName) {
    return this.models[model] || null
  }
}

export const modelsService = new ModelsService()
