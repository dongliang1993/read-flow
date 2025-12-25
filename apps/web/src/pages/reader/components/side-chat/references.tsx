import { X } from 'lucide-react'
import { useMemoizedFn } from 'ahooks'
import type { ChatReference } from '@read-flow/types'

type ReferencesProps = {
  references: ChatReference[]
  onChange: (references: ChatReference[]) => void
}

export const References = ({ references, onChange }: ReferencesProps) => {
  const handleRemoveReference = useMemoizedFn((reference: ChatReference) => {
    const newReferences = references.filter((r) => r.id !== reference.id)
    onChange(newReferences)
  })

  return (
    <div className='w-full flex gap-2 mb-2'>
      {references.map((reference) => (
        <div
          key={reference.id}
          className='text-sm text-neutral-500 text-ellipsis overflow-hidden whitespace-nowrap max-w-[140px] px-2.5 py-1 bg-neutral-100 rounded-2xl relative group text-center'
        >
          {reference.text}
          <div
            className='absolute top-1 right-1 cursor-pointer hidden group-hover:block bg-neutral-500 rounded-full p-0.5'
            onClick={() => handleRemoveReference(reference)}
          >
            <X className='size-2 text-white' />
          </div>
        </div>
      ))}
    </div>
  )
}
