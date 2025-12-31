import { env } from '../../config/env'
import { TavilySearch } from './tavily-search'
import type { WebSearchResult } from './types'

export async function webSearch(query: string): Promise<WebSearchResult[]> {
  const hasTavilyKey = !!env.tavily.apiKey

  console.log('Web Search - Available Providers', {
    hasTavilyKey,
  })

  // Priority 1: Tavily Search (if API key configured)
  if (hasTavilyKey) {
    console.log('Using Tavily Search')
    const tavilySearch = new TavilySearch()
    const results = await tavilySearch.search(query)

    console.log('Tavily results count:', results.length)
    return results
  }

  return []
}
