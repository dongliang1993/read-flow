import { tool } from 'ai'
import { z } from 'zod'

import { env } from '../../../config/env'

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
  answer?: string
}

async function tavilySearch(
  query: string,
  options: { maxResults?: number } = {}
): Promise<TavilyResponse> {
  const { maxResults = 5 } = options

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: env.tavily.apiKey,
      query,
      max_results: maxResults,
      include_answer: true,
      search_depth: 'basic',
    }),
  })

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.statusText}`)
  }

  return response.json()
}

export const webSearchTool = tool({
  description: '网络搜索',
  // @ts-ignore
  inputSchema: z.object({
    query: z.string().describe('搜索关键词或问题，使用英文搜索效果更好'),
  }),
  execute: async ({ query }: { query: string }) => {
    if (!env.tavily.apiKey) {
      return '网络搜索功能未配置，请设置 TAVILY_API_KEY 环境变量'
    }

    try {
      const result = await tavilySearch(query, { maxResults: 5 })

      if (!result.results?.length) {
        return '未找到相关搜索结果'
      }

      const formattedResults = result.results
        .map(
          (r, i) => `### ${i + 1}. ${r.title}\n**来源**: ${r.url}\n${r.content}`
        )
        .join('\n\n')

      const answer = result.answer ? `**摘要**: ${result.answer}\n\n` : ''

      return `${answer}${formattedResults}`
    } catch (error) {
      console.error('Web search error:', error)
      return `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  },
})
