// Unified search result interface
export interface WebSearchResult {
  title: string
  url: string
  content: string
}

export interface SearchOptions {
  domains?: string[]
}

export interface WebSearchSource {
  search(query: string): Promise<WebSearchResult[]>
}

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

export interface TavilyResponse {
  results: TavilySearchResult[]
  answer?: string
}
