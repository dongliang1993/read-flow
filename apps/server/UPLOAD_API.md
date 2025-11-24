# 书籍上传 API 文档

## 🎯 概述

本文档介绍如何使用书籍上传和文件管理 API。

## 📡 API 端点

### 1. 上传书籍

**端点：** `POST /api/v1/books/upload`

**Content-Type：** `multipart/form-data`

**请求参数：**

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| file | File | ✅ | EPUB 文件 |
| title | string | ✅ | 书籍标题 |
| author | string | ❌ | 作者名称 |

**响应：**

```json
{
  "book": {
    "id": 1,
    "title": "人类简史",
    "author": "尤瓦尔·赫拉利",
    "filePath": "1698765432000-sapiens.epub",
    "fileSize": 2458624,
    "status": "unread",
    "createdAt": "2025-10-22T10:00:00.000Z",
    "updatedAt": "2025-10-22T10:00:00.000Z"
  },
  "fileUrl": "https://xxx.supabase.co/storage/v1/object/public/books/1698765432000-sapiens.epub"
}
```

**示例（curl）：**

```bash
curl -X POST http://localhost:3001/api/v1/books/upload \
  -F "file=@/path/to/book.epub" \
  -F "title=人类简史" \
  -F "author=尤瓦尔·赫拉利"
```

**示例（JavaScript）：**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('title', '人类简史')
formData.append('author', '尤瓦尔·赫拉利')

const response = await fetch('http://localhost:3001/api/v1/books/upload', {
  method: 'POST',
  body: formData,
})

const { book, fileUrl } = await response.json()
```

---

### 2. 获取下载链接

**端点：** `GET /api/v1/books/:id/download`

**说明：** 生成 1 小时有效的签名 URL

**响应：**

```json
{
  "downloadUrl": "https://xxx.supabase.co/storage/v1/object/sign/books/xxx?token=xxx"
}
```

**示例：**

```bash
curl http://localhost:3001/api/v1/books/1/download
```

---

### 3. 直接下载文件

**端点：** `GET /api/v1/books/:id/file`

**说明：** 直接返回文件内容（用于浏览器下载）

**响应：** EPUB 文件流

**示例：**

```bash
# 下载并保存到本地
curl http://localhost:3001/api/v1/books/1/file -o book.epub
```

```html
<!-- 在网页中直接下载 -->
<a href="/api/v1/books/1/file" download>下载书籍</a>
```

---

### 4. 删除书籍（包括文件）

**端点：** `DELETE /api/v1/books/:id`

**说明：** 同时删除数据库记录和 Storage 中的文件

**响应：**

```json
{
  "message": "Book deleted successfully",
  "book": {
    "id": 1,
    "title": "人类简史",
    ...
  }
}
```

**示例：**

```bash
curl -X DELETE http://localhost:3001/api/v1/books/1
```

---

## 🎨 前端集成示例

### React 上传组件

```typescript
import { useState } from 'react'

export function BookUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('http://localhost:3001/api/v1/books/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { book, fileUrl } = await response.json()
      console.log('Upload success:', book, fileUrl)
      
      // 重置表单
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          书籍标题 *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium">
          作者
        </label>
        <input
          type="text"
          id="author"
          name="author"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          EPUB 文件 *
        </label>
        <input
          type="file"
          id="file"
          name="file"
          accept=".epub"
          required
          className="mt-1 block w-full"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? '上传中...' : '上传书籍'}
      </button>
    </form>
  )
}
```

### 书籍列表与下载

```typescript
import { useState, useEffect } from 'react'

interface Book {
  id: number
  title: string
  author: string | null
  filePath: string
  fileSize: number
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const response = await fetch('http://localhost:3001/api/v1/books')
    const { books } = await response.json()
    setBooks(books)
  }

  const handleDownload = async (bookId: number, title: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/books/${bookId}/download`)
      const { downloadUrl } = await response.json()
      
      // 在新标签页打开下载链接
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (bookId: number) => {
    if (!confirm('确定要删除这本书吗？')) return

    try {
      await fetch(`http://localhost:3001/api/v1/books/${bookId}`, {
        method: 'DELETE',
      })
      
      // 刷新列表
      fetchBooks()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <div key={book.id} className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">{book.title}</h3>
          {book.author && <p className="text-sm text-neutral-600">{book.author}</p>}
          <p className="text-xs text-neutral-500">
            大小: {(book.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleDownload(book.id, book.title)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              下载
            </button>
            <button
              onClick={() => handleDelete(book.id)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔍 错误处理

### 常见错误

| 状态码 | 错误信息 | 原因 | 解决方案 |
|--------|----------|------|----------|
| 400 | File is required | 未提供文件 | 确保 FormData 包含 file 字段 |
| 400 | Title is required | 未提供标题 | 确保 FormData 包含 title 字段 |
| 400 | Only EPUB files are supported | 文件格式不正确 | 只上传 .epub 文件 |
| 404 | Book not found | 书籍不存在 | 检查 bookId 是否正确 |
| 500 | Failed to upload file | Supabase 上传失败 | 检查 Storage bucket 是否创建，权限是否正确 |

### 调试技巧

1. **检查环境变量**
   ```bash
   cd apps/server
   cat .env | grep SUPABASE
   ```

2. **检查 Supabase Storage**
   - 登录 Supabase Dashboard
   - Storage → books bucket
   - 确认文件是否上传成功

3. **查看服务器日志**
   ```bash
   pnpm dev
   # 上传文件时查看控制台输出
   ```

---

## 📊 文件大小限制

### 当前限制

- **Supabase Free Plan**: 单文件最大 50MB
- **Supabase Pro Plan**: 单文件最大 5GB

### 自定义限制

如需修改上传大小限制，在路由中添加验证：

```typescript
booksRoute.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  // 限制为 20MB
  const MAX_SIZE = 20 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'File size exceeds 20MB' }, 400)
  }
  
  // ... 继续处理
})
```

---

## 🚀 性能优化

### 1. 使用 CDN

Supabase Storage 自带 CDN，公开文件会自动缓存。

### 2. 压缩文件

EPUB 文件已经是压缩格式，无需额外压缩。

### 3. 并发上传

前端可以实现多文件并发上传：

```typescript
const uploadPromises = files.map(file => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', file.name)
  
  return fetch('/api/v1/books/upload', {
    method: 'POST',
    body: formData,
  })
})

await Promise.all(uploadPromises)
```

---

## 📚 相关文档

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 数据库配置
- [ENV_SETUP.md](./ENV_SETUP.md) - 环境变量配置
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

