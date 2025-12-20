import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemoizedFn } from 'ahooks'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { noteService } from '@/service/note'

export const useNote = (bookId: string) => {
  const { data } = useInfiniteQuery({
    queryKey: ['note', bookId],
    queryFn: async ({ pageParam = 1 }) => {
      const notes = await noteService.getNotes(bookId, pageParam)
      return notes
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
    enabled: !!bookId,
  })

  /**
   * 删除摘录
   */
  const deleteNote = useCallback(
    async (noteId: number) => {
      try {
        await noteService.deleteNote(noteId)
        queryClient.invalidateQueries({ queryKey: ['note', bookId] })
      } catch (error) {
        toast.error('删除摘录失败')
        console.error('Failed to delete note:', error)
      }
    },
    [bookId]
  )

  return { data, deleteNote: useMemoizedFn(deleteNote) }
}
