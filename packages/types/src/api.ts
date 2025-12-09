import type { UIMessage } from 'ai'

export interface UpdateChatMessagesRequest {
  messages: UIMessage[]
  bookId: string
}
