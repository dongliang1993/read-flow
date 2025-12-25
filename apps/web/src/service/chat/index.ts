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
