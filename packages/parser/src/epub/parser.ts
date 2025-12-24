import EPub from 'epub2'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type {
  EpubMetadata,
  EpubTocItem,
  EpubChapter,
  EpubParseResult,
  ParseOptions,
} from './types'

export async function parseEpub(
  input: string | Buffer,
  options: ParseOptions = {}
): Promise<EpubParseResult> {
  const {
    extractCover = true,
    parseChapters = true,
    extractText = true,
  } = options

  // 处理输入：如果是 Buffer，写入临时文件
  let filePath: string
  let shouldCleanup = false

  if (typeof input === 'string') {
    filePath = input
  } else {
    // Buffer 写入临时文件
    filePath = join(tmpdir(), `epub-${randomUUID()}.epub`)
    writeFileSync(filePath, input)
    shouldCleanup = true
  }

  try {
    const result = await parseEpubFromPath(filePath, {
      extractCover,
      parseChapters,
      extractText,
    })

    return result
  } finally {
    // 清理临时文件
    if (shouldCleanup) {
      try {
        unlinkSync(filePath)
      } catch (err) {
        console.warn('Failed to cleanup temp file:', err)
      }
    }
  }
}

function parseEpubFromPath(
  filePath: string,
  options: {
    extractCover: boolean
    parseChapters: boolean
    extractText: boolean
  }
): Promise<EpubParseResult> {
  const { extractCover, parseChapters, extractText } = options

  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath)

    epub.on('error', reject)

    epub.on('end', async () => {
      try {
        // 元数据
        const metadata: EpubMetadata = {
          title: epub.metadata.title || 'Unknown Title',
          creator: epub.metadata.creator,
          publisher: epub.metadata.publisher,
          language: epub.metadata.language,
          identifier: epub.metadata.identifier,
          description: epub.metadata.description,
          pubDate: epub.metadata.date,
        }

        // 目录
        const toc: EpubTocItem[] = epub.toc.map((item, index) => ({
          id: item.id || `toc-${index}`,
          title: item.title || '',
          href: item.href || '',
        }))

        // 章节内容 - 根据 TOC 边界合并 flow 内容
        const chapters: EpubChapter[] = []
        if (parseChapters && toc.length > 0) {
          // 构建 href → flow index 的映射
          const hrefToFlowIndex = new Map<string, number>()
          epub.flow.forEach((item, index) => {
            // 移除锚点，只保留文件名
            const baseHref = (item.href || '').split('#')[0]
            if (baseHref && !hrefToFlowIndex.has(baseHref)) {
              hrefToFlowIndex.set(baseHref, index)
            }
          })

          for (let i = 0; i < toc.length; i++) {
            const tocItem = toc[i]
            const baseHref = tocItem.href.split('#')[0]
            const startIndex = hrefToFlowIndex.get(baseHref)

            if (startIndex === undefined) continue

            // 找下一个 TOC 条目的起始位置
            let endIndex = epub.flow.length
            for (let j = i + 1; j < toc.length; j++) {
              const nextHref = toc[j].href.split('#')[0]
              const nextIndex = hrefToFlowIndex.get(nextHref)
              if (nextIndex !== undefined && nextIndex > startIndex) {
                endIndex = nextIndex
                break
              }
            }

            // 合并从 startIndex 到 endIndex 的所有内容
            let combinedHtml = ''
            for (let j = startIndex; j < endIndex; j++) {
              const flowItem = epub.flow[j]
              if (!flowItem.id) continue
              try {
                const content = await getChapterContent(epub, flowItem.id)
                // 添加换行分隔不同文件的内容
                if (combinedHtml) {
                  combinedHtml += '<br/><br/>' // HTML 换行
                }

                combinedHtml += content
              } catch (err) {
                console.warn(`Failed to get content for ${flowItem.id}:`, err)
              }
            }

            chapters.push({
              id: tocItem.id,
              title: tocItem.title,
              href: tocItem.href,
              htmlContent: combinedHtml,
              textContent: extractText ? extractTextFromHtml(combinedHtml) : '',
            })
          }
        } else if (parseChapters) {
          // 如果没有 TOC，退回到原来的逻辑
          for (const item of epub.flow) {
            if (!item.id) continue
            try {
              const content = await getChapterContent(epub, item.id)
              chapters.push({
                id: item.id,
                title: item.title || '',
                href: item.href || '',
                htmlContent: content,
                textContent: extractText ? extractTextFromHtml(content) : '',
              })
            } catch (err) {
              console.warn(`Failed to get chapter ${item.id}:`, err)
            }
          }
        }

        // 封面
        let cover: Buffer | null = null
        if (extractCover && epub.metadata.cover) {
          try {
            cover = await getCoverImage(epub)
          } catch (err) {
            console.warn('Failed to get cover:', err)
          }
        }

        resolve({ metadata, cover, toc, chapters })
      } catch (err) {
        reject(err)
      }
    })

    epub.parse()
  })
}

function getChapterContent(epub: EPub, chapterId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (err, text) => {
      if (err) reject(err)
      else resolve(text || '')
    })
  })
}

function getCoverImage(epub: EPub): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    epub.getImage(epub.metadata.cover!, (err, data) => {
      if (err) reject(err)
      else resolve(data as Buffer)
    })
  })
}

function extractTextFromHtml(html: string): string {
  // 移除 script 和 style 标签及其内容
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // 将块级元素转换为换行符
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|blockquote|pre)>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // 移除其他 HTML 标签
  text = text.replace(/<[^>]+>/g, ' ')

  // 解码 HTML 实体
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))

  // 规范化空白：合并连续空格，但保留换行符
  text = text.replace(/[^\S\n]+/g, ' ') // 非换行空白合并为单个空格
  text = text.replace(/\n\s*\n/g, '\n\n') // 多个空行合并为两个换行
  text = text.replace(/^\s+|\s+$/gm, '') // 每行首尾空格去除
  text = text.trim()

  return text
}
