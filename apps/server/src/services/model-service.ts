import { createOpenAI } from '@ai-sdk/openai'

import { env } from '../config/env'

const openai = createOpenAI({
  apiKey: env.openai.apiKey,
  baseURL: env.openai.baseURL,
  headers: {
    Authorization: `Bearer ${env.openai.apiKey}`,
  },
})

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

  getModel(model: ModelName) {
    return this.models[model] || null
  }
}

export const modelsService = new ModelsService()
