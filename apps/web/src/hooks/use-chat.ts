import { useChat as useAIChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { useMemoizedFn } from 'ahooks'

import { env } from '@/config/env'

export const useChat = () => {
  const [input, setInput] = useState('')

  const { messages, status, error, stop, sendMessage } = useAIChat({
    transport: new DefaultChatTransport({
      api: `${env.apiBaseUrl}/api/v1/chat`,
    }),
    experimental_throttle: 50,
    messages: [],
    onError: (error) => {
      console.error('Error:', error)
    },
    onFinish: (message) => {
      console.log(message)
    },
  })

  const handleSubmit = useMemoizedFn(async (message: string) => {
    if (status !== 'ready') return

    try {
      await sendMessage({ text: message })
      setInput('')
    } catch (error) {}
  })

  return { messages, status, error, stop, handleSubmit, input, setInput }
}
