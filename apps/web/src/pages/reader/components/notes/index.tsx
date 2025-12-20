import { Search, FilePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NoteCard } from './note-card'
import { useNote } from '@/hooks/use-note'
import type { ListNote } from '@read-flow/types'

type NotesProps = {
  bookId: string
}

export const Notes = ({ bookId }: NotesProps) => {
  const { data, deleteNote } = useNote(bookId)
  const notes = data?.pages?.flat() ?? []

  return (
    <div className='flex h-full flex-col'>
      {/* 头部 */}
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-medium'>摘录</h2>
        <div className='flex items-center gap-2'>
          <Button className='size-7 cursor-pointer' variant='ghost' size='icon'>
            <Search size={16} />
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto py-2'>
        {notes.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center text-neutral-400'>
            <p>摘录对你重要的内容</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {notes.map((note: ListNote) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className='py-3'>
        <Button
          variant='outline'
          className='w-full gap-2 rounded-full cursor-pointer'
        >
          <FilePlus size={16} />
          添加注释
        </Button>
      </div>
    </div>
  )
}
