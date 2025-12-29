import { useCallback } from 'react'

import { cn } from '@/lib/utils'

import type { TOCItem } from '@/lib/document'

export type FlatTOCItem = {
  item: TOCItem
  depth: number
  index: number
}

type TOCItemComponentProps = {
  item: FlatTOCItem
  onItemClick: (item: TOCItem) => void
  isActive?: boolean
}

export const TOCItemComponent = ({
  item,
  onItemClick,
  isActive,
}: TOCItemComponentProps) => {
  const { depth, item: tocItem } = item

  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onItemClick(tocItem)
      e.preventDefault()
    },
    [tocItem, onItemClick]
  )

  return (
    <div
      className={cn(
        'cursor-pointer w-full h-full flex items-center py-1 rounded-md',
        isActive ? 'text-highlight-blue' : 'hover:bg-shade-03'
      )}
      style={{
        paddingInlineStart: `${(depth + 1) * 12}px`,
      }}
      onClick={handleItemClick}
    >
      <div className='select-none overflow-hidden whitespace-nowrap text-ellipsis'>
        {tocItem.label}
      </div>
    </div>
  )
}
