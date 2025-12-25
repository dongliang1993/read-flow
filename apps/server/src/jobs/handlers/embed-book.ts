import { eq } from 'drizzle-orm'

import { db } from '../../db'
import { chapters, chunks } from '../../db/schema'
import { chunkService } from '../../services/chunk-service'
import { embeddingService } from '../../services/embedding-service'
import { supabaseAdmin } from '../../lib/supabase'

import type { JobHandler, EmbedBookPayload, EmbedBookResult } from '../types'

export const embedBookHandler: JobHandler<EmbedBookPayload, EmbedBookResult> = {
  type: 'embedBook',

  async handle(payload) {
    const { bookId } = payload

    console.log(`[EmbedBook] Starting embedding for book ${bookId}`)

    const bookChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(chapters.order)

    if (bookChapters.length === 0) {
      console.log(`[EmbedBook] No chapters found for book ${bookId}`)
      return { chunksCount: 0, embeddingsCount: 0 }
    }

    console.log(`[EmbedBook] Found ${bookChapters.length} chapters`)

    await db.delete(chunks).where(eq(chunks.bookId, bookId))

    let totalChunks = 0
    let totalEmbeddings = 0

    for (const chapter of bookChapters) {
      if (!chapter.content) continue

      const chunkResults = chunkService.splitToChunks(chapter.content, {
        strategy: 'token',
        maxSize: 512,
        overlap: 50,
      })

      if (chunkResults.length === 0) continue

      console.log(
        `[EmbedBook] Chapter "${chapter.title}" split into ${chunkResults.length} chunks`
      )

      const contents = chunkResults.map((c) => c.content)
      const embeddings = await embeddingService.embedBatch(contents)

      for (let i = 0; i < chunkResults.length; i++) {
        const chunk = chunkResults[i]
        const embedding = embeddings[i]

        const [inserted] = await db
          .insert(chunks)
          .values({
            chapterId: chapter.id,
            bookId: bookId,
            order: chunk.order,
            content: chunk.content,
            tokenCount: chunk.tokenCount,
          })
          .returning({ id: chunks.id })

        await supabaseAdmin.rpc('update_chunk_embedding', {
          chunk_id: inserted.id,
          embedding_vector: embedding.embedding,
        })

        totalEmbeddings++
      }

      totalChunks += chunkResults.length
    }

    console.log(
      `[EmbedBook] Completed: ${totalChunks} chunks, ${totalEmbeddings} embeddings`
    )

    return {
      chunksCount: totalChunks,
      embeddingsCount: totalEmbeddings,
    }
  },
}
