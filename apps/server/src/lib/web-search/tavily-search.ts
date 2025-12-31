import { env } from '../../config/env'
import type {
  SearchOptions,
  WebSearchResult,
  WebSearchSource,
  TavilyResponse,
} from './types'

const TAVILY_URL = 'https://api.tavily.com/search'

export class TavilySearch implements WebSearchSource {
  private options: SearchOptions

  constructor(params?: SearchOptions) {
    this.options = params || {}
  }

  async search(query: string): Promise<WebSearchResult[]> {
    console.log('TavilySearch: options', this.options)

    // Get Tavily API key from settings
    const tavilyApiKey = env.tavily.apiKey

    if (!tavilyApiKey) {
      console.error('Tavily API key not configured')
      throw new Error(
        'Tavily API key is not configured. Please set it in Settings > API Keys.'
      )
    }

    // Apply domain filtering if specified
    if (this.options.domains && this.options.domains.length > 0) {
      const siteQuery = this.options.domains
        .map((domain) => `site:${domain}`)
        .join(' OR ')
      query = `${siteQuery} ${query}`
    }

    console.log('TavilySearch:', TAVILY_URL, query)

    const results: WebSearchResult[] = []

    try {
      const requestBody: Record<string, unknown> = {
        query: query.slice(0, 1000),
        search_depth: 'basic',
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
      }

      const response = await fetch(TAVILY_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tavilyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorDetails = await response.text()
        throw new Error(
          `Fetch failed with status code: ${response.status} and Details: ${errorDetails}`
        )
      }

      const jsonResult = (await response.json()) as TavilyResponse
      const results: WebSearchResult[] = []

      // Process answer if available
      if (jsonResult.answer) {
        results.push({
          title: 'AI Answer',
          url: '',
          content: jsonResult.answer,
        })
      }

      // Process search results
      if (jsonResult.results && Array.isArray(jsonResult.results)) {
        for (const result of jsonResult.results) {
          results.push({
            title: result.title || '',
            url: result.url || '',
            content: result.content || '',
          })
        }
      }

      return results
    } catch (error) {
      console.error('TavilySearch error', error)
      return results
    }
  }
}
