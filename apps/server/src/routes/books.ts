import { Hono } from 'hono'
import { db } from '../db'
import { books, readingProgress } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { supabaseAdmin } from '../lib/supabase'

const booksRoute = new Hono()

booksRoute.get('/', async (c) => {
  try {
    const allBooks = await db.select().from(books)
    // .orderBy(desc(books.createdAt))
    return c.json({ books: allBooks })
  } catch (error) {
    console.error('Get books error:', error)
    return c.json({ error: 'Failed to fetch books' }, 500)
  }
})

booksRoute.get('/:id/file', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const [book] = await db.select().from(books).where(eq(books.id, id))

    if (!book || !book.filePath) {
      return c.json({ error: 'Book file not found' }, 404)
    }

    console.log('📖 开始下载书籍文件:', book.filePath)

    const { data, error } = await supabaseAdmin.storage
      .from('books')
      .download(book.filePath)

    if (error) {
      console.error('❌ Supabase 下载失败:', error)
      return c.json({ error: 'Failed to download file' }, 500)
    }

    console.log('✅ Supabase 下载成功')
    console.log('   数据类型:', data.constructor.name)
    console.log('   数据大小:', data.size, 'bytes')
    console.log('   MIME 类型:', data.type)

    return new Response(data, {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('❌ 文件下载错误:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

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

booksRoute.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const author = formData.get('author') as string

    if (!file) {
      return c.json({ error: 'File is required' }, 400)
    }

    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    // 🔧 修复：生成安全的文件名（只使用 .epub 扩展名）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const safeFileName = `${timestamp}-${randomStr}.epub`

    console.log('📦 生成安全文件名:', safeFileName)

    const fileBuffer = await file.arrayBuffer()

    console.log('📦 准备上传到 Supabase Storage:', {
      fileName: safeFileName,
      bufferSize: fileBuffer.byteLength,
      bucket: 'books',
    })

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('books')
      .upload(safeFileName, fileBuffer, {
        contentType: 'application/epub+zip',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('books').getPublicUrl(safeFileName)

    const [newBook] = await db
      .insert(books)
      .values({
        title,
        author: author || null,
        filePath: uploadData.path,
        coverUrl: null,
        fileSize: file.size,
        status: 'unread',
      })
      .returning()

    return c.json(
      {
        book: newBook,
        fileUrl: publicUrl,
      },
      201
    )
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Internal server error' }, 500)
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
      .download(book.filePath)

    if (error) {
      console.error('Failed to generate download URL:', error)
      return c.json({ error: 'Failed to generate download URL' }, 500)
    }

    const encodedFilename = encodeURIComponent(`${book.title}.epub`)

    return new Response(data, {
      headers: {
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        'Content-Type': 'application/epub+zip',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return c.json({ error: 'Internal server error' }, 500)
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
