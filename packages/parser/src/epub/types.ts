/**
 * EPUB 元数据
 */
export interface EpubMetadata {
  title: string
  creator?: string
  publisher?: string
  language?: string
  identifier?: string
  description?: string
  pubDate?: string
}

/**
 * EPUB 目录项
 */
export interface EpubTocItem {
  id: string
  title: string
  href: string
  children?: EpubTocItem[]
}

/**
 * EPUB 章节内容
 */
export interface EpubChapter {
  id: string
  title: string
  href: string
  htmlContent: string
  textContent: string
}

/**
 * EPUB 解析结果
 */
export interface EpubParseResult {
  metadata: EpubMetadata
  cover: Buffer | null
  toc: EpubTocItem[]
  chapters: EpubChapter[]
}

/**
 * 解析选项
 */
export interface ParseOptions {
  /** 是否提取封面，默认 true */
  extractCover?: boolean
  /** 是否解析章节内容，默认 true */
  parseChapters?: boolean
  /** 是否提取纯文本内容，默认 true */
  extractText?: boolean
}

