import { eq } from 'drizzle-orm'
import { parseEpub } from '@read-flow/parser'
import { db } from '../../db'
import { books, chapters } from '../../db/schema'
import { supabaseAdmin } from '../../lib/supabase'

import type { JobHandler, ParseBookPayload, ParseBookResult } from '../types'

/**
 * parseBook Job Handler
 * 解析 EPUB 书籍文件，提取元数据和章节内容
 */
export const parseBookHandler: JobHandler<ParseBookPayload, ParseBookResult> = {
  type: 'parseBook',

  async handle(payload) {
    const { bookId, filePath } = payload

    console.log(`[ParseBook] Parsing book ${bookId} from ${filePath}`)
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('books').getPublicUrl(filePath)
    const fileBuffer = await fetch(publicUrl).then((res) => res.arrayBuffer())

    // 解析 EPUB 文件
    const result = await parseEpub(Buffer.from(fileBuffer), {
      extractCover: true,
      parseChapters: true,
      extractText: true,
    })

    const { metadata, chapters: parsedChapters } = result

    // 更新书籍信息
    await db
      .update(books)
      .set({
        title: metadata.title,
        author: metadata.creator || undefined,
        language: metadata.language || undefined,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId))

    // 存储章节内容
    if (parsedChapters.length > 0) {
      // 先删除旧的章节（如果重新解析）
      await db.delete(chapters).where(eq(chapters.bookId, bookId))

      // 批量插入章节
      const chapterRecords = parsedChapters.map((chapter, index) => ({
        bookId,
        title: chapter.title || null,
        href: chapter.href || null,
        order: index,
        content: chapter.textContent || null,
        htmlContent: chapter.htmlContent || null,
        wordCount: chapter.textContent
          ? chapter.textContent.split(/\s+/).filter(Boolean).length
          : null,
      }))

      await db.insert(chapters).values(chapterRecords)

      console.log(
        `[ParseBook] Stored ${parsedChapters.length} chapters for book ${bookId}`
      )
    }

    console.log(
      `[ParseBook] Book ${bookId} parsed: ${metadata.title} by ${metadata.creator}, ${parsedChapters.length} chapters`
    )

    return {
      title: metadata.title,
      author: metadata.creator,
      chaptersCount: parsedChapters.length,
    }
  },
}
