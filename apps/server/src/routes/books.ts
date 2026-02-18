import { Hono } from 'hono'
import { db } from '../db'
import { books, readingProgress } from '../db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { supabaseAdmin } from '../lib/supabase'
// import { enqueueJob } from '../jobs'

import type { Book, BookStatus, BookFormat } from '@read-flow/shared'
import type { auth } from '../lib/auth'

type Variables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const booksRoute = new Hono<{ Variables: Variables }>()

/**
 * 获取所有书籍
 * GET /api/v1/books
 */
booksRoute.get('/', async (c) => {
  try {
    const allBooks = await db.select().from(books)
    const allBooksWithCovers: Book[] = [...allBooks].map((book) => ({
      ...book,
      status: book.status as BookStatus | null,
      format: book.format as BookFormat,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    }))

    const booksWithCovers = allBooksWithCovers.filter((book) => book.coverPath)
    if (booksWithCovers.length > 0) {
      const paths = booksWithCovers.map((book) => book.coverPath!)
      const { data, error } = await supabaseAdmin.storage
        .from('book-cover')
        .createSignedUrls(paths, 3600)

      if (!error && data) {
        data.forEach((item, index) => {
          if (item.signedUrl) {
            booksWithCovers[index].coverUrl = item.signedUrl
          }
        })
      }
    }

    return c.json({ books: allBooksWithCovers })
  } catch (error) {
    console.error('Get books error:', error)
    return c.json({ error: 'Failed to fetch books' }, 500)
  }
})

/**
 * 获取书籍信息
 * GET /api/v1/books/:id
 * @param id 书籍 ID
 * @returns {Promise<Response>} 书籍信息
 */
booksRoute.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    // 添加验证
    if (isNaN(id)) {
      return c.json({ error: 'Invalid book ID' }, 400)
    }

    const [book] = await db.select().from(books).where(eq(books.id, id))

    if (!book) {
      return c.json({ error: 'Book not found' }, 404)
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('books').getPublicUrl(book.filePath || '')

    const bookWithUrl: Book = {
      ...book,
      format: book.format as BookFormat,
      status: book.status as BookStatus | null,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      fileUrl: publicUrl,
    }

    return c.json({ book: bookWithUrl })
  } catch (error) {
    console.error('Get book error:', error)
    return c.json({ error: 'Failed to fetch book' }, 500)
  }
})

/**
 * 上传书籍
 * POST /api/v1/books/upload
 */

booksRoute.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('title') as string
    const author = formData.get('author') as string
    const format = formData.get('format') as string
    const coverFile = formData.get('cover') as File
    const coverFileName = coverFile?.name
    const language = formData.get('language') as string
    const tempFilename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${format.toLowerCase()}`

    if (!file) {
      return c.json({ error: 'File is required' }, 400)
    }

    if (!fileName) {
      return c.json({ error: 'Title is required' }, 400)
    }

    console.log('📦 文件名:', { fileName, tempFilename })

    const fileBuffer = await file.arrayBuffer()
    const coverFileBuffer = await coverFile.arrayBuffer()

    const uploadResults = await Promise.allSettled(
      [
        supabaseAdmin.storage.from('books').upload(tempFilename, fileBuffer, {
          contentType: 'application/epub+zip',
          cacheControl: '3600',
          upsert: false,
        }),
        coverFileBuffer
          ? supabaseAdmin.storage
              .from('book-cover')
              .upload(coverFileName, coverFileBuffer, {
                cacheControl: '3600',
                upsert: false,
              })
          : null,
      ].filter(Boolean)
    )

    const [bookUploadResult, coverUploadResult] = uploadResults

    if (bookUploadResult.status === 'rejected') {
      console.error('Upload error:', bookUploadResult.reason)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    if (coverUploadResult.status === 'rejected') {
      console.error('Upload error:', coverUploadResult.reason)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    const bookFilePath = bookUploadResult.value?.data?.path
    const coverFilePath = coverUploadResult.value?.data?.path

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('books').getPublicUrl(bookFilePath || '')

    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('book-cover')
      .createSignedUrl(coverFilePath || '', 3600)

    const coverPublicUrl = signedUrlData?.signedUrl

    const [newBook] = await db
      .insert(books)
      .values({
        title: fileName,
        author: author || null,
        filePath: bookFilePath,
        coverUrl: coverFilePath,
        fileSize: file.size,
        status: 'unread',
        format: format,
        language: language || null,
        coverPath: coverFilePath,
      })
      .returning()

    // await enqueueJob({
    //   type: 'parseBook',
    //   payload: {
    //     bookId: newBook.id,
    //     filePath: bookFilePath || '',
    //   },
    // })

    return c.json(
      {
        book: {
          ...newBook,
          fileUrl: publicUrl,
          coverUrl: coverPublicUrl,
        },
      },
      201
    )
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Internal server error' }, 500)
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
        author: body.author || null,
        format: body.format,
        language: body.language || null,
        coverUrl: body.coverUrl,
        coverPath: body.coverPath,
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

    const [book] = await db.select().from(books).where(eq(books.id, id))

    if (!book) {
      return c.json({ error: 'Book not found' }, 404)
    }

    if (book.filePath) {
      try {
        await supabaseAdmin.storage.from('books').remove([book.filePath])
      } catch (storageError) {
        console.error('Failed to delete file from storage:', storageError)
      }
    }

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning()

    return c.json({ message: 'Book deleted successfully', book: deletedBook })
  } catch (error) {
    console.error('Delete book error:', error)
    return c.json({ error: 'Failed to delete book' }, 500)
  }
})

booksRoute.get('/:id/download', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const [book] = await db.select().from(books).where(eq(books.id, id))

    if (!book) {
      return c.json({ error: 'Book not found' }, 404)
    }

    if (!book.filePath) {
      return c.json({ error: 'Book file not found' }, 404)
    }

    const { data, error } = await supabaseAdmin.storage
      .from('books')
      .createSignedUrl(book.filePath, 3600)

    if (error || !data) {
      console.error('Failed to generate signed URL:', error)
      return c.json({ error: 'Failed to generate download URL' }, 500)
    }

    return c.json({ url: data.signedUrl })
  } catch (error) {
    console.error('Download error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

booksRoute.get('/:id/progress', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = parseInt(c.req.param('id'))

    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.bookId, bookId),
          eq(readingProgress.userId, user.id)
        )
      )
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
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const bookId = parseInt(c.req.param('id'))
    const body = await c.req.json()

    const [newProgress] = await db
      .insert(readingProgress)
      .values({
        bookId,
        userId: user.id,
        currentLocation: body.location,
        progressCurrent: body.progressCurrent ?? body.progress ?? 0,
        progressTotal: body.progressTotal ?? 0,
        status: body.status ?? 'reading',
        lastReadAt: body.lastReadAt ? new Date(body.lastReadAt) : new Date(),
      })
      .returning()

    return c.json({ progress: newProgress })
  } catch (error) {
    console.error('Update progress error:', error)
    return c.json({ error: 'Failed to update reading progress' }, 500)
  }
})

export default booksRoute
