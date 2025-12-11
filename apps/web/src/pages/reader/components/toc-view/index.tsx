import { TableOfContents } from 'lucide-react'
import { useCallback, useState, useMemo } from 'react'
import { List as VirtualList } from 'react-window'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TOCItemComponent, type FlatTOCItem } from './toc-item'
import { useReaderStore } from '@/store/reader-store'

import type { TOCItem } from '@/lib/document'
import type { RowComponentProps } from 'react-window'
import { useMemoizedFn } from 'ahooks'

type TOCViewDropdownProps = {
  toc: TOCItem[]
}

const useFlattenedTOC = (toc: TOCItem[], expandedItems: Set<string>) => {
  return useMemo(() => {
    const flattenTOC = (items: TOCItem[], depth = 0): FlatTOCItem[] => {
      const result: FlatTOCItem[] = []
      items.forEach((item, index) => {
        const isExpanded = expandedItems.has(item.href || '')
        result.push({ item, depth, index, isExpanded })
        if (item.subitems && isExpanded) {
          result.push(...flattenTOC(item.subitems, depth + 1))
        }
      })
      return result
    }

    return flattenTOC(toc)
  }, [toc, expandedItems])
}

type CustomRowComponentProps = {
  data: FlatTOCItem[]
  onItemClick: (item: TOCItem) => void
  activeHref: string | null
}
const RowComponent = ({
  index,
  style,
  data,
  onItemClick,
  activeHref,
}: RowComponentProps<CustomRowComponentProps>) => {
  const item = data[index]
  const isActive = item.item.href === activeHref

  return (
    <div style={style} key={index}>
      <TOCItemComponent
        item={item}
        onItemClick={onItemClick}
        isActive={isActive}
      />
    </div>
  )
}

export const TOCViewDropdown = ({ toc }: TOCViewDropdownProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const isTOCViewDropdownOpen = useReaderStore(
    (state) => state.openDropdown === 'toc'
  )
  const view = useReaderStore((state) => state.view)
  const setOpenDropdown = useReaderStore((state) => state.setOpenDropdown)
  const progress = useReaderStore((state) => state.progress)

  const activeHref = useMemo(
    () => progress?.sectionHref || null,
    [progress?.sectionHref]
  )

  const handleToggleTOCViewDropdown = useCallback(
    (isOpen: boolean) => {
      setOpenDropdown(isOpen ? 'toc' : null)
    },
    [setOpenDropdown]
  )

  const flatItems = useFlattenedTOC(toc, expandedItems)

  const handleItemClick = useMemoizedFn((item: TOCItem) => {
    if (item.href && view) {
      view.goTo(item.href)
    }
  })

  return (
    <DropdownMenu
      open={isTOCViewDropdownOpen}
      onOpenChange={handleToggleTOCViewDropdown}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 focus-visible:ring-0 focus-visible:ring-offset-0'
        >
          <TableOfContents size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='max-h-[calc(100vh-8rem)]  w-80 overflow-y-auto p-0 bg-white'
        align='start'
        sideOffset={4}
      >
        <div className='h-full p-2'>
          <VirtualList<CustomRowComponentProps>
            rowCount={flatItems.length}
            rowComponent={RowComponent}
            rowProps={{
              data: flatItems,
              onItemClick: handleItemClick,
              activeHref,
            }}
            rowHeight={30}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
