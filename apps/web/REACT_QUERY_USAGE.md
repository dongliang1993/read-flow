# React Query 使用指南

## 📚 已实现的功能

### 1. Books Service API (`src/service/books/index.ts`)

提供了完整的书籍 API 调用函数：

```typescript
import { booksApi } from '@/service/books'

// 获取所有书籍
const { books } = await booksApi.getAll()

// 获取单本书籍
const { book } = await booksApi.getById(1)

// 上传书籍
const { book, fileUrl } = await booksApi.upload(file, '书名', '作者')

// 删除书籍
await booksApi.delete(1)

// 获取下载链接
const { downloadUrl } = await booksApi.getDownloadUrl(1)
```

### 2. React Query Hooks (`src/hooks/use-books.ts`)

提供了便捷的 React Query hooks：

#### `useBooks()` - 获取书籍列表

```typescript
import { useBooks } from '@/hooks/use-books'

function BookList() {
  const { data: books, isLoading, error } = useBooks()

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误：{error.message}</div>

  return (
    <div>
      {books?.map((book) => (
        <div key={book.id}>{book.title}</div>
      ))}
    </div>
  )
}
```

#### `useBook(id)` - 获取单本书籍

```typescript
import { useBook } from '@/hooks/use-books'

function BookDetail({ id }: { id: number }) {
  const { data: book, isLoading } = useBook(id)

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      <h1>{book?.title}</h1>
      <p>{book?.author}</p>
    </div>
  )
}
```

#### `useUploadBook()` - 上传书籍

```typescript
import { useUploadBook } from '@/hooks/use-books'

function UploadForm() {
  const uploadBook = useUploadBook()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const author = formData.get('author') as string

    uploadBook.mutate(
      { file, title, author },
      {
        onSuccess: (data) => {
          console.log('上传成功:', data)
          e.currentTarget.reset()
        },
        onError: (error) => {
          console.error('上传失败:', error)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" accept=".epub" required />
      <input type="text" name="title" placeholder="书名" required />
      <input type="text" name="author" placeholder="作者" />
      <button type="submit" disabled={uploadBook.isPending}>
        {uploadBook.isPending ? '上传中...' : '上传书籍'}
      </button>
    </form>
  )
}
```

#### `useDeleteBook()` - 删除书籍

```typescript
import { useDeleteBook } from '@/hooks/use-books'

function BookCard({ book }: { book: Book }) {
  const deleteBook = useDeleteBook()

  const handleDelete = () => {
    if (confirm(`确定要删除《${book.title}》吗？`)) {
      deleteBook.mutate(book.id, {
        onSuccess: () => {
          console.log('删除成功')
        },
      })
    }
  }

  return (
    <div>
      <h3>{book.title}</h3>
      <button onClick={handleDelete} disabled={deleteBook.isPending}>
        {deleteBook.isPending ? '删除中...' : '删除'}
      </button>
    </div>
  )
}
```

#### `useDownloadBook()` - 下载书籍

```typescript
import { useDownloadBook } from '@/hooks/use-books'

function BookCard({ book }: { book: Book }) {
  const downloadBook = useDownloadBook()

  return (
    <button
      onClick={() => downloadBook.mutate(book.id)}
      disabled={downloadBook.isPending}
    >
      {downloadBook.isPending ? '下载中...' : '下载'}
    </button>
  )
}
```

## 🎯 完整示例组件

示例组件已创建在 `src/components/library/book-list.tsx`

```typescript
import { BookList } from '@/components/library/book-list'

function LibraryPage() {
  return (
    <div>
      <h1>我的书库</h1>
      <BookList />
    </div>
  )
}
```

## ⚙️ React Query 配置

配置文件位于 `src/lib/query-client.ts`：

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 分钟内不重新请求
      retry: 1,                   // 失败后重试 1 次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新请求
    },
  },
})
```

## 🔄 缓存与更新策略

### 自动缓存失效

- ✅ **上传书籍后** - 自动刷新书籍列表
- ✅ **删除书籍后** - 自动刷新书籍列表

### 乐观更新

删除书籍时使用了乐观更新：

```typescript
onMutate: async (deletedId) => {
  // 立即从列表中移除（不等待服务器响应）
  const previousBooks = queryClient.getQueryData(BOOKS_QUERY_KEY)
  queryClient.setQueryData(
    BOOKS_QUERY_KEY,
    previousBooks.filter((book) => book.id !== deletedId)
  )
  return { previousBooks }
},
onError: (err, deletedId, context) => {
  // 如果失败，恢复之前的数据
  if (context?.previousBooks) {
    queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
  }
},
```

## 💡 高级用法

### 手动刷新数据

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { BOOKS_QUERY_KEY } from '@/hooks/use-books'

function RefreshButton() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
  }

  return <button onClick={handleRefresh}>刷新</button>
}
```

### 预加载数据

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { BOOKS_QUERY_KEY, booksApi } from '@/hooks/use-books'

function BookPreview({ bookId }: { bookId: number }) {
  const queryClient = useQueryClient()

  const handleMouseEnter = () => {
    // 鼠标悬停时预加载书籍详情
    queryClient.prefetchQuery({
      queryKey: [...BOOKS_QUERY_KEY, bookId],
      queryFn: () => booksApi.getById(bookId),
    })
  }

  return <div onMouseEnter={handleMouseEnter}>悬停预加载</div>
}
```

### 访问缓存数据

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { BOOKS_QUERY_KEY } from '@/hooks/use-books'

function SomeComponent() {
  const queryClient = useQueryClient()

  // 读取缓存的书籍列表
  const cachedBooks = queryClient.getQueryData(BOOKS_QUERY_KEY)

  // 设置缓存数据
  queryClient.setQueryData(BOOKS_QUERY_KEY, newBooks)
}
```

## 🧪 状态管理

React Query 提供的状态：

```typescript
const {
  data,           // 数据
  error,          // 错误信息
  isLoading,      // 首次加载中
  isFetching,     // 后台更新中
  isSuccess,      // 成功状态
  isError,        // 错误状态
  refetch,        // 手动重新请求
} = useBooks()
```

Mutation 提供的状态：

```typescript
const {
  mutate,         // 触发 mutation
  mutateAsync,    // 异步触发
  isPending,      // 执行中
  isSuccess,      // 成功
  isError,        // 失败
  reset,          // 重置状态
} = useUploadBook()
```

## 📚 相关文档

- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [React Query 最佳实践](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [服务端 API 文档](../../../server/UPLOAD_API.md)

## 🎯 快速开始

1. **使用书籍列表：**
   ```tsx
   import { BookList } from '@/components/library/book-list'

   <BookList />
   ```

2. **创建自定义组件：**
   ```tsx
   import { useBooks } from '@/hooks/use-books'

   function MyBookList() {
     const { data: books } = useBooks()
     return <div>{/* 你的UI */}</div>
   }
   ```

3. **上传书籍：**
   ```tsx
   import { useUploadBook } from '@/hooks/use-books'

   const uploadBook = useUploadBook()
   uploadBook.mutate({ file, title, author })
   ```

