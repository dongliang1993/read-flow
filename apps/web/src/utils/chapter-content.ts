import type { FoliateView } from '@/types/view'

/**
 * 从 FoliateView 获取当前章节的文本内容
 */
export function getCurrentChapterContent(view: FoliateView | null): string {
  if (!view) {
    return ''
  }

  try {
    const contents = view.renderer.getContents()

    if (!contents || contents.length === 0) {
      return ''
    }

    const textParts: string[] = []

    for (const { doc } of contents) {
      if (doc && doc.body) {
        const text = doc.body.innerText || doc.body.textContent || ''
        if (text.trim()) {
          textParts.push(text.trim())
        }
      }
    }

    return textParts.join('\n\n')
  } catch (error) {
    console.error('Failed to get chapter content:', error)
    return ''
  }
}

/**
 * 截取内容，避免超过 token 限制
 */
export function truncateContent(
  content: string,
  maxLength: number = 8000
): string {
  if (content.length <= maxLength) {
    return content
  }

  return content.slice(0, maxLength) + '\n\n[内容已截断...]'
}
