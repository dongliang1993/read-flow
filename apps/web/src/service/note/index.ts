import { env } from '@/config/env'
import type { CreateNoteRequest } from '@read-flow/shared'

class NoteService {
  /**
   * 创建摘录
   * @param note
   * @returns
   */
  async createNote(note: CreateNoteRequest) {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to create note')
    }

    const result = await response.json()
    return result.note
  }

  async getNotes(bookId: string, page: number) {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/note/listNotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, page }),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to get notes')
    }

    const result = await response.json()
    return result.notes
  }

  async deleteNote(noteId: number) {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/note/${noteId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to delete note')
    }

    const result = await response.json()
    return result
  }
}

export const noteService = new NoteService()
