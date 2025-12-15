import type { BookDoc, TOCItem, SectionItem } from '@/lib/document'

export interface ChapterInfo {
  index: number
  href: string
  title: string
  size: number
  estimatedTokens: number
}

export interface ChapterContent {
  href: string
  title: string
  content: string
  contentHash: string
}

export interface ChapterSummaryRequest {
  bookId: string
  chapterIndex: number
  chapterHref: string
  chapterTitle: string
  content: string
  contentHash: string
  summaryType?: 'brief' | 'detailed'
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function estimateTokens(textLength: number): number {
  return Math.ceil(textLength / 2)
}

function smartTruncate(content: string, maxLength: number = 8000): string {
  if (content.length <= maxLength) {
    return content
  }

  const headLength = Math.floor(maxLength * 0.45)
  const tailLength = Math.floor(maxLength * 0.35)

  const head = content.slice(0, headLength)
  const tail = content.slice(-tailLength)

  return `${head}\n\n[...中间内容省略，共省略 ${
    content.length - headLength - tailLength
  } 字...]\n\n${tail}`
}

export class BookService {
  private bookDoc: BookDoc
  private sectionMap: Map<
    string,
    SectionItem & {
      content: string
      contentHash: string
    }
  > | null = null

  constructor(bookDoc: BookDoc) {
    this.bookDoc = bookDoc
  }

  getTOC(): TOCItem[] {
    return this.bookDoc.toc || []
  }

  getSections(): SectionItem[] {
    return this.bookDoc.sections || []
  }

  getChapterList(): ChapterInfo[] {
    const sections = this.getSections()
    const toc = this.getTOC()

    return sections.map((section, index) => {
      const tocItem = this.findTocItemByHref(toc, section.id)
      const estimatedTextSize = section.size * 0.4
      const tokens = estimateTokens(estimatedTextSize)

      return {
        index,
        href: section.id,
        title: tocItem?.label || `Section ${index + 1}`,
        size: section.size,
        estimatedTokens: tokens,
      }
    })
  }

  private findTocItemByHref(
    tocItems: TOCItem[],
    href: string
  ): TOCItem | undefined {
    for (const item of tocItems) {
      const [itemHref] = this.bookDoc.splitTOCHref(item.href)
      if (itemHref === href) {
        return item
      }
      if (item.subitems) {
        const found = this.findTocItemByHref(item.subitems, href)
        if (found) return found
      }
    }
    return undefined
  }

  // 懒加载创建 Map
  private getSectionMap(): Map<
    string,
    SectionItem & { content: string; contentHash: string }
  > {
    if (!this.sectionMap) {
      const sections = this.getSections()
      this.sectionMap = new Map(
        sections.map((s) => [s.id, { ...s, content: '', contentHash: '' }])
      )
    }

    return this.sectionMap
  }

  async getChapterContent(sectionHref: string): Promise<ChapterContent | null> {
    try {
      const sections = this.getSections()
      const toc = this.getTOC()
      const sectionMap = this.getSectionMap()
      const section = sectionMap.get(sectionHref)

      if (!section) {
        return null
      }

      // 如果有缓存，直接使用
      if (section.content && section.contentHash) {
        const tocItem = this.findTocItemByHref(toc, section.id)

        return {
          href: section.id,
          title: tocItem?.label || '',
          content: section.content,
          contentHash: section.contentHash,
        }
      }

      // 找到当前 section 的索引
      const startIndex = sections.findIndex((s) => s.id === sectionHref)
      if (startIndex === -1) {
        return null
      }

      // 找出所有 TOC 项对应的 section id（作为边界）
      const tocHrefs = new Set(
        this.flattenToc(toc).map((item) => {
          const [baseHref] = this.bookDoc.splitTOCHref(item.href)
          return baseHref
        })
      )

      // 从 startIndex 开始，收集内容直到遇到下一个 TOC 边界
      let content = ''
      for (let i = startIndex; i < sections.length; i++) {
        const section = sections[i]

        // 如果是下一个 TOC 项的开始，停止
        if (i > startIndex && tocHrefs.has(section.id)) {
          break
        }

        // @ts-ignore
        const doc = await section.createDocument()
        content += (doc?.body?.innerText || '') + '\n'
      }

      const contentHash = await hashContent(content)
      const tocItem = this.findTocItemByHref(toc, section.id)

      // 更新 sectionMap
      for (let i = startIndex; i < sections.length; i++) {
        const section = sections[i]
        sectionMap.set(section.id, {
          ...section,
          content,
          contentHash,
        })
      }

      return {
        href: section.id,
        title: tocItem?.label || '',
        content,
        contentHash,
      }
    } catch (error) {
      console.error('Failed to get chapter content:', error)
      return null
    }
  }

  async getChapterContentForSummary(
    sectionIndex: number,
    maxLength: number = 8000
  ): Promise<ChapterContent | null> {
    const chapter = await this.getChapterContent(sectionIndex)

    if (!chapter) {
      return null
    }

    return {
      ...chapter,
      content: smartTruncate(chapter.content, maxLength),
    }
  }

  async prepareChapterSummaryRequest(
    bookId: string,
    sectionIndex: number,
    summaryType: 'brief' | 'detailed' = 'brief'
  ): Promise<ChapterSummaryRequest | null> {
    const maxLength = summaryType === 'detailed' ? 12000 : 8000
    const chapter = await this.getChapterContentForSummary(
      sectionIndex,
      maxLength
    )

    if (!chapter) {
      return null
    }

    return {
      bookId,
      chapterIndex: chapter.index,
      chapterHref: chapter.href,
      chapterTitle: chapter.title,
      content: chapter.content,
      contentHash: chapter.contentHash,
      summaryType,
    }
  }

  getChapterInfoBySectionIndex(sectionIndex: number): ChapterInfo | null {
    const chapters = this.getChapterList()
    return chapters[sectionIndex] || null
  }

  findSectionIndexByHref(href: string): number {
    const sections = this.getSections()
    return sections.findIndex((s) => s.id === href)
  }

  findSectionIndexByTocItem(tocItem: TOCItem): number {
    const [href] = this.bookDoc.splitTOCHref(tocItem.href)
    return this.findSectionIndexByHref(href)
  }

  // 辅助方法：扁平化 TOC
  private flattenToc(items: TOCItem[]): TOCItem[] {
    const result: TOCItem[] = []
    for (const item of items) {
      result.push(item)
      if (item.subitems) {
        result.push(...this.flattenToc(item.subitems))
      }
    }
    return result
  }
}

export function createBookService(bookDoc: BookDoc): BookService {
  return new BookService(bookDoc)
}
