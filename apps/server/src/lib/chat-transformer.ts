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

export interface QuotePart {
  type: 'quote'
  text: string
  source?: string
  id?: string
}

export interface ToolInvocationPart {
  /**
   * 前端 `ai` UIMessage 通常会把工具调用/结果渲染为 `tool-<toolName>` 的 part
   * 这里用 template literal 保持通用性（例如 tool-webSearch / tool-ragSearch）
   */
  type: `tool-${string}`
  toolCallId: string
  state: 'call' | 'output-available' | 'error'
  input?: unknown
  output?: unknown
  errorText?: string
}

export type MessagePart = TextPart | ImagePart | QuotePart | ToolInvocationPart

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

    const textContent = parts
      .filter(
        (p): p is TextPart | QuotePart =>
          (p.type === 'text' || p.type === 'quote') && !!p.text
      )
      .map((p) => (p.type === 'quote' ? `[引用]: ${p.text}` : p.text))
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

function appendText(parts: MessagePart[], delta: string) {
  const text = (delta ?? '').toString()
  if (!text) return
  const last = parts[parts.length - 1]
  if (last && last.type === 'text') {
    ;(last as TextPart).text += text
    return
  }
  parts.push({ type: 'text', text })
}

function findLatestToolPart(parts: MessagePart[], toolCallId: string) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]
    if (
      typeof p === 'object' &&
      p &&
      (p as any).toolCallId === toolCallId &&
      typeof (p as any).type === 'string' &&
      (p as any).type.startsWith('tool-')
    ) {
      return p as ToolInvocationPart
    }
  }
  return undefined
}

/**
 * 将 AI SDK 的 response.messages（模型层消息）转换成可落库、可回放的 UI parts。
 *
 * 目标：
 * - 合并 assistant 文本（多段 text）
 * - 记录 tool call（state=call）
 * - 记录 tool result（state=output-available / error），并尽量回填到对应的 toolCallId
 */
export function convertResponseMessagesToParts(
  responseMessages: unknown
): MessagePart[] {
  const msgs = Array.isArray(responseMessages) ? responseMessages : []
  const parts: MessagePart[] = []

  for (const msg of msgs as any[]) {
    const role = msg?.role
    const content = msg?.content

    // assistant: text + tool-call
    if (role === 'assistant') {
      if (typeof content === 'string') {
        appendText(parts, content)
        continue
      }

      if (Array.isArray(content)) {
        for (const c of content) {
          if (c?.type === 'text' && typeof c.text === 'string') {
            appendText(parts, c.text)
            continue
          }

          if (c?.type === 'tool-call') {
            const toolName = String(c.toolName || 'tool')
            const toolCallId = String(c.toolCallId || '')
            parts.push({
              type: `tool-${toolName}`,
              toolCallId,
              state: 'call',
              input: c.input,
            })
          }
        }
      }
      continue
    }

    // tool: tool-result（有的 provider 会用 role=tool 承载结果）
    if (role === 'tool') {
      const items = Array.isArray(content) ? content : [content]
      for (const c of items) {
        if (!c) continue

        const toolName = String(c.toolName || 'tool')
        const toolCallId = String(c.toolCallId || '')
        let result = c?.output

        if (result.type === 'json') {
          result = result.value
        }

        const isError = !!c.isError || !!c.error
        const errorText =
          typeof c.error === 'string'
            ? c.error
            : typeof c.errorText === 'string'
            ? c.errorText
            : undefined

        const existing = toolCallId
          ? findLatestToolPart(parts, toolCallId)
          : undefined
        if (existing) {
          existing.state = isError ? 'error' : 'output-available'
          if (result !== undefined) existing.output = result
          if (errorText) existing.errorText = errorText
        } else {
          parts.push({
            type: `tool-${toolName}`,
            toolCallId,
            state: isError ? 'error' : 'output-available',
            output: result,
            errorText,
          })
        }
      }
    }
  }

  return parts
}
