import type { ChatReference } from '@read-flow/types'

type ReferencesProps = {
  references: ChatReference[]
}

export const References = ({ references }: ReferencesProps) => {
  return (
    <div className='w-full flex gap-2 mb-2'>
      {references.map((reference) => (
        <div
          key={reference.id}
          className='text-sm text-neutral-500 text-ellipsis overflow-hidden whitespace-nowrap max-w-[130px] px-2 py-1 bg-neutral-50 rounded-2xl'
        >
          {reference.text}
        </div>
      ))}
    </div>
  )
}
