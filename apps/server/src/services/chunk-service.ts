import { encodingForModel } from 'js-tiktoken'

export type SplitStrategy = 'token' | 'character' | 'sentence' | 'paragraph'

export type SplitOptions = {
  strategy: SplitStrategy
  maxSize?: number
  overlap?: number
}

export type ChunkResult = {
  content: string
  tokenCount: number
  order: number
}

const DEFAULT_OPTIONS: Record<
  SplitStrategy,
  { maxSize: number; overlap: number }
> = {
  token: { maxSize: 512, overlap: 50 },
  character: { maxSize: 2000, overlap: 200 },
  sentence: { maxSize: 10, overlap: 2 },
  paragraph: { maxSize: 5, overlap: 1 },
}

class ChunkService {
  private encoder = encodingForModel('gpt-4')

  countTokens(text: string): number {
    return this.encoder.encode(text).length
  }

  splitToChunks(text: string, options: SplitOptions): ChunkResult[] {
    const { strategy, maxSize, overlap } = {
      ...DEFAULT_OPTIONS[options.strategy],
      ...options,
    }

    switch (strategy) {
      case 'token':
        return this.splitByTokens(text, maxSize!, overlap!)
      case 'character':
        return this.splitByCharacters(text, maxSize!, overlap!)
      case 'sentence':
        return this.splitBySentences(text, maxSize!, overlap!)
      case 'paragraph':
        return this.splitByParagraphs(text, maxSize!, overlap!)
      default:
        return this.splitByTokens(text, maxSize!, overlap!)
    }
  }

  private splitByTokens(
    text: string,
    maxTokens: number,
    overlap: number
  ): ChunkResult[] {
    const tokens = this.encoder.encode(text)
    const chunks: ChunkResult[] = []
    let start = 0
    let order = 0

    while (start < tokens.length) {
      const end = Math.min(start + maxTokens, tokens.length)
      const chunkTokens = tokens.slice(start, end)
      const content = this.encoder.decode(chunkTokens)

      chunks.push({
        content,
        tokenCount: chunkTokens.length,
        order: order++,
      })

      if (end >= tokens.length) break
      start = end - overlap
    }

    return chunks
  }

  private splitByCharacters(
    text: string,
    maxChars: number,
    overlap: number
  ): ChunkResult[] {
    const chunks: ChunkResult[] = []
    let start = 0
    let order = 0

    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length)

      if (end < text.length) {
        const lastSpace = text.lastIndexOf(' ', end)
        if (lastSpace > start) {
          end = lastSpace
        }
      }

      const content = text.slice(start, end).trim()
      if (content) {
        chunks.push({
          content,
          tokenCount: this.countTokens(content),
          order: order++,
        })
      }

      if (end >= text.length) break
      start = end - overlap
    }

    return chunks
  }

  private splitBySentences(
    text: string,
    maxSentences: number,
    overlap: number
  ): ChunkResult[] {
    const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g
    const sentences = text.match(sentenceRegex) || [text]
    const chunks: ChunkResult[] = []
    let start = 0
    let order = 0

    while (start < sentences.length) {
      const end = Math.min(start + maxSentences, sentences.length)
      const content = sentences.slice(start, end).join('').trim()

      if (content) {
        chunks.push({
          content,
          tokenCount: this.countTokens(content),
          order: order++,
        })
      }

      if (end >= sentences.length) break
      start = end - overlap
    }

    return chunks
  }

  private splitByParagraphs(
    text: string,
    maxParagraphs: number,
    overlap: number
  ): ChunkResult[] {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim())
    const chunks: ChunkResult[] = []
    let start = 0
    let order = 0

    while (start < paragraphs.length) {
      const end = Math.min(start + maxParagraphs, paragraphs.length)
      const content = paragraphs.slice(start, end).join('\n\n').trim()

      if (content) {
        chunks.push({
          content,
          tokenCount: this.countTokens(content),
          order: order++,
        })
      }

      if (end >= paragraphs.length) break
      start = end - overlap
    }

    return chunks
  }
}

export const chunkService = new ChunkService()
