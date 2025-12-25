// apps/server/src/services/search-service.ts
import { supabaseAdmin } from '../lib/supabase'
import { embeddingService } from './embedding-service'

class SearchService {
  async searchChunks(
    query: string,
    bookId: number,
    options: { limit?: number; threshold?: number } = {}
  ) {
    const { limit = 8, threshold = 0.3 } = options

    // 1. 将查询文本转为 embedding
    const queryEmbedding = await embeddingService.embed(query)

    // 2. 向量相似度搜索（使用 Supabase RPC）
    const { data, error } = await supabaseAdmin.rpc('search_chunks', {
      query_embedding: queryEmbedding.embedding,
      match_book_id: bookId,
      match_count: limit,
      match_threshold: threshold,
    })

    if (error) {
      console.error('[searchChunks] rpc error:', error)
      throw new Error(error.message)
    }

    return data ?? []
  }
}

export const searchService = new SearchService()
