import { useChat as useAIChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useState, useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { env } from '@/config/env'

import { getChatHistory, saveChatHistory } from '@/service/chat'

export type { ChatStatus } from 'ai'

type ChatContext = {
  activeBookId: string
}

type UseChatOptions = {
  chatContext: ChatContext
}
export const useChat = (options: UseChatOptions) => {
  const { chatContext } = options
  const { activeBookId } = chatContext

  const [input, setInput] = useState('')

  const buildMessageParts = useCallback((question: string) => {
    const parts: any[] = []

    if (question.trim()) {
      parts.push({
        type: 'text',
        text: question.trim(),
      })
    }

    return parts
  }, [])

  const { messages, status, error, stop, sendMessage, setMessages } = useAIChat(
    {
      transport: new DefaultChatTransport({
        api: `${env.apiBaseUrl}/api/v1/chat`,
        body: () => ({
          bookId: activeBookId,
          messages: messages,
        }),
      }),
      experimental_throttle: 50,
      onError: (error) => {
        console.error('Error:', error)
      },
      onFinish: async ({ message, messages }) => {
        console.log('Message finished:', { message, messages })
        await saveChatHistory(activeBookId, messages)
      },
    }
  )

  const handleSubmit = useMemoizedFn(async (outInput: string) => {
    if (status !== 'ready') {
      return
    }

    const trimmedInput = (outInput || input).trim()
    const messageParts = buildMessageParts(trimmedInput)

    try {
      setInput('')
      await sendMessage({ parts: messageParts })

      setMessages((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) {
          return prev
        }

        const nextMessages = [...prev]

        for (let i = nextMessages.length - 1; i >= 0; i--) {
          const message = nextMessages[i]
          if (message?.role !== 'user') {
            continue
          }

          nextMessages[i] = {
            ...message,
            parts: messageParts,
            metadata: {},
          }
          break
        }

        return nextMessages
      })
    } catch (error) {}
  })

  const initializeThread = useMemoizedFn(async () => {
    if (activeBookId) {
      try {
        const messages = await getChatHistory(activeBookId)

        setMessages(messages)
      } catch (error) {
        console.error('Error initializing thread:', error)
      }
    }
  })

  useEffect(() => {
    initializeThread()
  }, [activeBookId])

  return { messages, status, error, stop, handleSubmit, input, setInput }
}
