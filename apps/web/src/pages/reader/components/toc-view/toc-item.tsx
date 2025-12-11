import { useCallback } from 'react'

import { cn } from '@/lib/utils'

import type { TOCItem } from '@/lib/document'

export type FlatTOCItem = {
  item: TOCItem
  depth: number
  index: number
  isExpanded: boolean
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
    [item, onItemClick]
  )

  return (
    <div
      className={cn(
        'cursor-pointer w-full flex items-center py-1  rounded-md',
        isActive ? 'bg-muted' : 'hover:bg-muted'
      )}
      style={{
        paddingInlineStart: `${(depth + 1) * 12}px`,
      }}
      onClick={handleItemClick}
    >
      <div
        className='select-none'
        style={{
          maxWidth: 'calc(100% - 24px)',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {tocItem.label}
      </div>
    </div>
  )
}
