import { env } from '@/config/env'

export const getChatHistory = async (bookId: string) => {
  const response = await fetch(
    `${env.apiBaseUrl}/api/v1/chat/history/${bookId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch chat history')
  }

  const data = await response.json()

  return data.messages
}

export const saveChatHistory = async (bookId: string, messages: Message[]) => {
  const response = await fetch(`${env.apiBaseUrl}/api/v1/chat/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId, messages }),
  })

  if (!response.ok) {
    throw new Error('Failed to save chat history')
  }

  return response.json()
}
