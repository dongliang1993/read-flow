import { tool } from 'ai'
import { z } from 'zod'

import { searchService } from '../../../services/search-service'

const cache = new Map<string, Promise<string>>()

export const createRagSearchTool = (bookId: number) =>
  tool({
    description: '搜索书籍中的相关内容',
    // @ts-ignore
    inputSchema: z.object({
      query: z.string().describe('搜索关键词或问题'),
    }),
    execute: async ({ query }: { query: string }) => {
      const key = `${bookId}:${query.trim()}`

      if (!cache.has(key)) {
        cache.set(
          key,
          (async () => {
            const chunks = await searchService.searchChunks(query, bookId, {
              limit: 5,
              threshold: 0.3,
            })
            if (!chunks?.length) return '未找到相关片段'
            return chunks.map((c: any) => c.content).join('\n\n---\n\n')
          })()
        )
      }

      return cache.get(key)!
    },
  })
