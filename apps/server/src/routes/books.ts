import { Hono } from 'hono'
import { db } from '../db'
import { books, readingProgress } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

const booksRoute = new Hono()

booksRoute.get('/', async (c) => {
  try {
    const allBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
    return c.json({ books: allBooks })
  } catch (error) {
    console.error('Get books error:', error)
    return c.json({ error: 'Failed to fetch books' }, 500)
  }
})

booksRoute.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const [book] = await db.select().from(books).where(eq(books.id, id))

    if (!book) {
      return c.json({ error: 'Book not found' }, 404)
    }

    return c.json({ book })
  } catch (error) {
    console.error('Get book error:', error)
    return c.json({ error: 'Failed to fetch book' }, 500)
  }
})

booksRoute.post('/', async (c) => {
  try {
    const body = await c.req.json()

    if (!body.title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title: body.title,
        author: body.author,
        coverUrl: body.coverUrl,
        filePath: body.filePath,
        fileSize: body.fileSize,
        status: body.status || 'unread',
      })
      .returning()

    return c.json({ book: newBook }, 201)
  } catch (error) {
    console.error('Create book error:', error)
    return c.json({ error: 'Failed to create book' }, 500)
  }
})

booksRoute.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()

    const [updatedBook] = await db
      .update(books)
      .set({
        title: body.title,
        author: body.author,
        coverUrl: body.coverUrl,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning()

    if (!updatedBook) {
      return c.json({ error: 'Book not found' }, 404)
    }

    return c.json({ book: updatedBook })
  } catch (error) {
    console.error('Update book error:', error)
    return c.json({ error: 'Failed to update book' }, 500)
  }
})

booksRoute.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning()

    if (!deletedBook) {
      return c.json({ error: 'Book not found' }, 404)
    }

    return c.json({ message: 'Book deleted successfully', book: deletedBook })
  } catch (error) {
    console.error('Delete book error:', error)
    return c.json({ error: 'Failed to delete book' }, 500)
  }
})

booksRoute.get('/:id/progress', async (c) => {
  try {
    const bookId = parseInt(c.req.param('id'))
    const userId = c.req.query('userId') || 'default-user'

    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.bookId, bookId))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(1)

    return c.json({ progress: progress || null })
  } catch (error) {
    console.error('Get progress error:', error)
    return c.json({ error: 'Failed to fetch reading progress' }, 500)
  }
})

booksRoute.put('/:id/progress', async (c) => {
  try {
    const bookId = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const userId = body.userId || 'default-user'

    const [newProgress] = await db
      .insert(readingProgress)
      .values({
        bookId,
        userId,
        currentLocation: body.location,
        progress: body.progress,
      })
      .returning()

    return c.json({ progress: newProgress })
  } catch (error) {
    console.error('Update progress error:', error)
    return c.json({ error: 'Failed to update reading progress' }, 500)
  }
})

export default booksRoute
