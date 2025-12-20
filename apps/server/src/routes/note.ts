import { Hono } from 'hono'
import { db } from '../db'
import { notes } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { CreateNoteRequest } from '@read-flow/types'

const noteRoute = new Hono()

noteRoute.post('/listNotes', async (c) => {
  try {
    const body = (await c.req.json()) as CreateNoteRequest
    const bookId = body.bookId ? parseInt(body.bookId) : null

    if (!bookId) {
      return c.json({ error: 'Book ID is required' }, 400)
    }

    const notesData = await db
      .select()
      .from(notes)
      .where(eq(notes.bookId, bookId))
      .orderBy(desc(notes.createdAt))
      .limit(10)

    return c.json({ notes: notesData })
  } catch (error) {
    console.error('Get notes error:', error)
    return c.json({ error: 'Failed to fetch notes' }, 500)
  }
})

noteRoute.post('/', async (c) => {
  try {
    const body = (await c.req.json()) as CreateNoteRequest
    const bookId = body.bookId ? parseInt(body.bookId) : null
    const title = body.title || ''
    const author = body.author || ''
    const sourcePlain = body.source?.plain || ''
    const sourceRaw = body.source?.raw || ''

    if (!bookId) {
      return c.json({ error: 'Book ID is required' }, 400)
    }

    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    if (!sourcePlain || !sourceRaw) {
      return c.json({ error: 'Source content is required' }, 400)
    }

    const [newNote] = await db
      .insert(notes)
      .values({
        bookId,
        title,
        author,
        sourcePlain,
        sourceRaw,
      })
      .returning()

    return c.json({ note: newNote })
  } catch (error) {
    console.error('Create note error:', error)
    return c.json({ error: 'Failed to create note' }, 500)
  }
})

noteRoute.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    if (isNaN(id)) {
      return c.json({ error: 'Invalid note ID' }, 400)
    }

    const [deletedNote] = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning()

    if (!deletedNote) {
      return c.json({ error: 'Note not found' }, 404)
    }

    return c.json({ message: 'Note deleted successfully', note: deletedNote })
  } catch (error) {
    console.error('Delete note error:', error)
    return c.json({ error: 'Failed to delete note' }, 500)
  }
})

export default noteRoute
