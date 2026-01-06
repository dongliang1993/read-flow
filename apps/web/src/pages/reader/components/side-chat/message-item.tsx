import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { MessageTools } from './message-tools'
import { Tool, ToolHeader, ToolContent, ToolOutput } from '@/components/tool'
import { OptionList } from '@/components/web-search'
import { PlanSteps } from '@/components/plan/plan-steps'

import type { UIMessage, UIMessagePart } from 'ai'

type MessageItemProps = {
  message: UIMessage
  onShareOpen: (content: string) => void
}

const getMarkdownContent = (message: UIMessage) => {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('\n')
}

const getPlainText = (message: UIMessage) => {
  return getMarkdownContent(message)
    .replace(/[#*`_~\[\]]/g, '')
    .replace(/\n+/g, '\n')
    .trim()
}

export const MessageItem = ({ message, onShareOpen }: MessageItemProps) => {
  const isAssistant = message.role === 'assistant'
  const isUser = message.role === 'user'
  const messageId = message.id

  const renderMessagePart = (
    part: UIMessagePart<any, any>,
    messageId: string,
    isAssistant: boolean
  ) => {
    const type = part.type

    if (type === 'text') {
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
              p: ({ children }) => (
                <p className='mb-2 last:mb-0 text-black font-normal'>
                  {children}
                </p>
              ),
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

    // tool-webSearch
    if (type === 'tool-webSearch') {
      const { toolCallId, state } = part

      return (
        <div key={toolCallId} className='w-full max-w-[400px]'>
          <Tool>
            <ToolHeader state={state} type='tool-webSearch' />
            <ToolContent className='max-w-[400px] overflow-hidden'>
              <ToolOutput
                errorText={undefined}
                output={
                  <OptionList options={part.output} selectionMode={false} />
                }
              />
            </ToolContent>
          </Tool>
        </div>
      )
    }

    // tool-createPlan
    if (type === 'tool-createPlan') {
      const { toolCallId, state, output } = part

      // 收集所有 updatePlanStep 的输出作为步骤状态更新
      // 注意：需要取每个 stepId 的最新状态
      const allUpdates =
        message.parts
          ?.filter(
            (p) =>
              p.type === 'tool-updatePlanStep' &&
              p.state === 'output-available' &&
              (p as any).output
          )
          .map(
            (p) =>
              (p as any).output as {
                stepId: string
                status: 'running' | 'completed' | 'error'
                result?: string
              }
          )
          .filter(Boolean) || []

      // 合并相同 stepId 的更新，保留最新的状态
      const stepUpdatesMap = new Map<
        string,
        {
          stepId: string
          status: 'running' | 'completed' | 'error'
          result?: string
        }
      >()
      for (const update of allUpdates) {
        stepUpdatesMap.set(update.stepId, update)
      }
      const stepUpdates = Array.from(stepUpdatesMap.values())

      return (
        <div key={toolCallId} className='w-full max-w-[400px]'>
          <Tool>
            <ToolHeader state={state} type='tool-createPlan' />
            <ToolContent>
              {output && (
                <PlanSteps output={output} stepUpdates={stepUpdates} />
              )}
            </ToolContent>
          </Tool>
        </div>
      )
    }

    // tool-updatePlanStep 不需要单独渲染，状态会合并到 createPlan 中显示
    if (type === 'tool-updatePlanStep') {
      return null
    }

    return null
  }

  return (
    <div
      className={'flex w-full min-w-0 gap-1'}
      key={message.id}
      id={message.id}
    >
      {isUser && (
        <div
          key={message.id}
          className='w-full flex gap-3 items-start justify-end'
        >
          <div className='flex-1 bg-gray-100 rounded-lg rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto'>
            {message.parts.map((part, index) =>
              renderMessagePart(part, `${messageId}-${index}`, false)
            )}
          </div>
        </div>
      )}

      {isAssistant && (
        <div
          key={message.id}
          className='flex flex-col gap-3 items-start w-full'
        >
          <div className='flex-1 py-2 w-full'>
            {message.parts.map((part, index) =>
              renderMessagePart(part, `${messageId}-${index}`, true)
            )}
          </div>
          <MessageTools
            onShareOpen={onShareOpen}
            content={getMarkdownContent(message)}
            plainText={getPlainText(message)}
          />
        </div>
      )}
    </div>
  )
}
