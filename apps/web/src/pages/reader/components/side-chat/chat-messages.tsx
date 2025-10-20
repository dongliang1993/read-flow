import type { UIMessage, UIMessagePart } from 'ai'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ChatMessagesProps = {
  messages: UIMessage[]
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const renderMessagePart = (
    part: UIMessagePart<any, any>,
    messageId: string,
    isAssistant: boolean
  ) => {
    if (part.type === 'text') {
      return (
        <div
          key={`${messageId}-${part.type}`}
          className={`text-sm leading-relaxed prose prose-sm max-w-none ${
            isAssistant ? 'prose-neutral dark:prose-invert' : 'prose-invert'
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
              ul: ({ children }) => (
                <ul className='mb-2 last:mb-0 list-disc pl-4'>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className='mb-2 last:mb-0 list-decimal pl-4'>{children}</ol>
              ),
              li: ({ children }) => <li className='mb-1'>{children}</li>,
              code: ({ inline, children, ...props }: any) =>
                inline ? (
                  <code
                    className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      isAssistant
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        : 'bg-blue-800 text-blue-100'
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className={`block px-3 py-2 rounded text-xs font-mono overflow-x-auto ${
                      isAssistant
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        : 'bg-blue-800 text-blue-100'
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
              pre: ({ children }) => (
                <pre className='mb-2 last:mb-0'>{children}</pre>
              ),
              strong: ({ children }) => (
                <strong className='font-semibold'>{children}</strong>
              ),
              em: ({ children }) => <em className='italic'>{children}</em>,
              h1: ({ children }) => (
                <h1 className='text-lg font-bold mb-2'>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className='text-base font-bold mb-2'>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className='text-sm font-bold mb-1'>{children}</h3>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className={`border-l-4 pl-3 my-2 ${
                    isAssistant
                      ? 'border-neutral-400 dark:border-neutral-600'
                      : 'border-blue-400'
                  }`}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {part.text}
          </ReactMarkdown>
        </div>
      )
    }

    return null
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      {messages.map((message) => {
        const isAssistant = message.role === 'assistant'
        const messageId = message.id

        if (isAssistant) {
          return (
            <div key={message.id} className='flex gap-3 items-start'>
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                <Bot className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]'>
                {message.parts.map((part, index) =>
                  renderMessagePart(part, `${messageId}-${index}`, true)
                )}
              </div>
            </div>
          )
        }

        return (
          <div key={message.id} className='flex gap-3 items-start justify-end'>
            <div className='flex-1 bg-blue-600 dark:bg-blue-700 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto'>
              {message.parts.map((part, index) =>
                renderMessagePart(part, `${messageId}-${index}`, false)
              )}
            </div>
            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center'>
              <User className='w-5 h-5 text-neutral-600 dark:text-neutral-300' />
            </div>
          </div>
        )
      })}
    </div>
  )
}
