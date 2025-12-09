import type { ModelMessage, UIMessage } from 'ai'

/**
 * UIMessage 的 part 类型
 */
export interface TextPart {
  type: 'text'
  text: string
}

export interface ImagePart {
  type: 'image'
  image: string
}

export type MessagePart = TextPart | ImagePart

/**
 * 数据库中存储的聊天记录格式
 */
export interface ChatHistoryRecord {
  id: number
  role: string
  content: unknown // jsonb 类型，存储 parts 数组
  bookId: number | null
  userId: string
  createdAt: Date
}

/**
 * 将数据库中的 parts 转换为 ModelMessage（用于 AI 调用）
 */
export function convertHistoryToModelMessages(
  history: ChatHistoryRecord[]
): ModelMessage[] {
  return history.map((record) => {
    const parts = record.content as MessagePart[]

    // 提取所有文本内容
    const textContent = parts
      .filter((p): p is TextPart => p.type === 'text' && !!p.text)
      .map((p) => p.text)
      .join('\n')

    return {
      role: record.role as 'user' | 'assistant' | 'system',
      content: textContent || '',
    }
  })
}

/**
 * 将数据库记录转换为 UIMessage（用于返回给前端）
 */
export function convertHistoryToUIMessages(
  history: ChatHistoryRecord[]
): UIMessage[] {
  return history.map((record) => ({
    id: record.id.toString(),
    role: record.role as 'user' | 'assistant',
    parts: record.content as MessagePart[],
    createdAt: record.createdAt,
  })) as unknown as UIMessage[]
}

/**
 * 将纯文本转换为 parts 格式（用于存储 AI 响应）
 */
export function textToParts(text: string): MessagePart[] {
  return [{ type: 'text', text }]
}

/**
 * 从 parts 中提取纯文本
 */
export function partsToText(parts: MessagePart[]): string {
  return parts
    .filter((p): p is TextPart => p.type === 'text' && !!p.text)
    .map((p) => p.text)
    .join('\n')
}
