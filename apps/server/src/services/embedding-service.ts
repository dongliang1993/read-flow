import { env } from '../config/env'

export type EmbeddingResult = {
  embedding: number[]
  tokenCount: number
}

class EmbeddingService {
  private model = 'text-embedding-3-small'
  private dimensions = 1536
  private maxBatchSize = 100

  async embed(content: string): Promise<EmbeddingResult> {
    const results = await this.embedBatch([content])
    return results[0]
  }

  async embedBatch(contents: string[]): Promise<EmbeddingResult[]> {
    if (contents.length === 0) return []

    const results: EmbeddingResult[] = []

    for (let i = 0; i < contents.length; i += this.maxBatchSize) {
      const batch = contents.slice(i, i + this.maxBatchSize)
      const batchResults = await this.callEmbeddingAPI(batch)
      results.push(...batchResults)
    }

    return results
  }

  private async callEmbeddingAPI(inputs: string[]): Promise<EmbeddingResult[]> {
    const response = await fetch(`${env.openai.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: inputs,
        dimensions: this.dimensions,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Embedding API error: ${response.status} ${error}`)
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[]; index: number }>
      usage: { prompt_tokens: number; total_tokens: number }
    }

    return data.data
      .sort((a, b) => a.index - b.index)
      .map((item, idx) => ({
        embedding: item.embedding,
        tokenCount: Math.ceil(data.usage.prompt_tokens / inputs.length),
      }))
  }
}

export const embeddingService = new EmbeddingService()

