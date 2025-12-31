import { useChat as useAIChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useMemoizedFn } from 'ahooks'
import { cloneDeep } from 'lodash-es'

import { env } from '@/config/env'
import { getChatHistory } from '@/service/chat'
import { processQuoteMessages } from '@/service/ai/utils'

import type { ChatContext, ChatReference } from '@read-flow/shared'
import type { UIMessage } from 'ai'

export type { ChatStatus } from 'ai'

type UseChatOptions = {
  model: string
  chatContext: ChatContext
}

export const createReferenceId = () => {
  const cryptoObj =
    typeof globalThis !== 'undefined' ? (globalThis as any).crypto : undefined
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID() as string
  }
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useChat = (options: UseChatOptions) => {
  const { chatContext } = options

  const { activeBookId } = chatContext

  const [input, setInput] = useState('')
  const [references, setReferences] = useState<ChatReference[]>([])

  const optionsRef = useRef<UseChatOptions>(options)
  optionsRef.current = options

  const messagesRef = useRef<UIMessage[]>([])

  const buildMessageParts = useCallback(
    (question: string, references: ChatReference[]) => {
      const parts: any[] = []

      references.forEach((reference, index) => {
        parts.push({
          type: 'quote',
          text: reference.text,
          source: `引用${index + 1}`,
          id: reference.id,
        })
      })

      if (question.trim()) {
        parts.push({
          type: 'text',
          text: question.trim(),
        })
      }

      return parts
    },
    []
  )

  const { messages, status, error, stop, sendMessage, setMessages } = useAIChat(
    {
      transport: new DefaultChatTransport({
        api: `${env.apiBaseUrl}/api/v1/chat`,
        prepareSendMessagesRequest: ({ messages, body }) => {
          const processedMessages = processQuoteMessages(messages)
          console.log(processedMessages, chatContext, 'processedMessages')

          return {
            body: {
              ...body,
              bookId: optionsRef.current.chatContext.activeBookId,
              model: optionsRef.current.model,
              messages: processedMessages.slice(-1),
              chatContext: optionsRef.current.chatContext,
            },
          }
        },
      }),
      experimental_throttle: 50,
      onError: (error) => {
        console.error('Error:', error)
      },
      onFinish: async ({ message, messages }) => {
        console.log('Message finished:', { message, messages })
      },
    }
  )

  console.log(messages, 'messagesRef.current')

  const handleSubmit = useMemoizedFn(async (outInput: string) => {
    if (status !== 'ready') {
      return
    }

    const trimmedInput = (outInput || input).trim()
    const referenceSnapshot = cloneDeep(references)
    const messageParts = buildMessageParts(trimmedInput, referenceSnapshot)

    try {
      setInput('')
      setReferences([])
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
            metadata: {
              references: referenceSnapshot,
            },
          }
          break
        }

        messagesRef.current = nextMessages

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

  const setChatContext = useMemoizedFn((chatContext: ChatContext) => {
    optionsRef.current.chatContext = chatContext
  })

  useEffect(() => {
    initializeThread()
  }, [activeBookId])

  return {
    messages,
    status,
    error,
    stop,
    handleSubmit,
    input,
    setInput,
    setChatContext,

    // references
    references,
    setReferences,
  }
}
