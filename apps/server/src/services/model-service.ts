import { createOpenAI } from '@ai-sdk/openai'
import modelsConfig from '@read-flow/shared/data/models-config'

import { env } from '../config/env'

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

  getConfigs(): ModelsConfiguration {
    return modelsConfig as ModelsConfiguration
  }

  getModel(model: ModelName) {
    return this.models[model] || null
  }
}

export const modelsService = new ModelsService()
