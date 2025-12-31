import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Option = {
  title: string
  url: string
  content: string
}

type OptionListProps = {
  options: Option[]
  selectionMode?: 'single' | 'multiple' | false
}

export const OptionList = ({
  options,
  selectionMode = 'single',
}: OptionListProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleOption = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else {
        next.add(url)
      }
      return next
    })
  }

  const showSelection = selectionMode !== false

  const CheckBox = ({ isChecked }: { isChecked: boolean }) => {
    return (
      <div
        className={`mt-0.5 size-4 rounded border shrink-0 flex items-center justify-center ${
          isChecked
            ? 'bg-neutral-800 border-neutral-800'
            : 'border-neutral-300 bg-white'
        }`}
      >
        {isChecked && (
          <svg
            className='size-3 text-white'
            viewBox='0 0 12 12'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M2 6l3 3 5-5' />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div className='rounded-xl bg-neutral-50 divide-y divide-neutral-200'>
      {options.map((option) => {
        const isChecked = selected.has(option.url)

        return (
          <div
            key={option.url}
            className='flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-100 first:rounded-t-xl last:rounded-b-xl'
            onClick={() => toggleOption(option.url)}
          >
            {showSelection && <CheckBox isChecked={isChecked} />}
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-medium text-neutral-900'>
                {option.title}
              </span>
              <a
                href={option.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-neutral-400 hover:text-neutral-600 truncate my-1'
                onClick={(e) => e.stopPropagation()}
              >
                来源: {option.url}
              </a>
              <div className='text-sm text-neutral-500 prose prose-sm prose-neutral max-w-none mt-1'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {option.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
