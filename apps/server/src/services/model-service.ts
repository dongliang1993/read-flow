import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

import { env } from '../config/env'

const openai = createOpenAICompatible({
  apiKey: env.openai.apiKey,
  baseURL: env.openai.baseURL,
  name: 'OpenAI Compatible',
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
