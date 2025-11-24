# 类型共享架构说明

## 🎯 概述

项目采用 Monorepo 架构，通过 `@read-flow/types` 包实现前后端类型共享，确保类型一致性。

## 📦 类型包结构

```
packages/types/
├── src/
│   ├── book.ts      # 核心数据类型
│   └── index.ts     # 导出入口
├── package.json
└── tsconfig.json
```

## 🔄 类型定义流程

### 1. 数据库 Schema → Types 包

**服务端定义数据库表结构：**
```typescript
// apps/server/src/db/schema.ts
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  // ...
})
```

**Types 包提供通用类型：**
```typescript
// packages/types/src/book.ts
export interface Book {
  id: number
  title: string
  author: string | null
  coverUrl: string | null
  filePath: string | null
  fileSize: number | null
  status: string
  createdAt: string
  updatedAt: string
}
```

### 2. 服务端引用

```typescript
// apps/server/src/db/schema.ts
import type { Book, NewBook } from '@read-flow/types'

// 重新导出，保持原有导入路径可用
export type { Book, NewBook }
```

```typescript
// apps/server/src/routes/books.ts
import { type Book } from '../db/schema'
// 或
import type { Book } from '@read-flow/types'
```

### 3. 前端引用

```typescript
// apps/web/src/service/books/index.ts
import type { Book } from '@read-flow/types'

export interface BooksResponse {
  books: Book[]
}
```

```typescript
// apps/web/src/hooks/use-books.ts
import type { Book } from '@read-flow/types'

export function useBooks() {
  return useQuery<Book[]>({...})
}
```

## 📋 可用类型列表

### Book 相关

```typescript
// 完整的书籍信息
interface Book {
  id: number
  title: string
  author: string | null
  coverUrl: string | null
  filePath: string | null
  fileSize: number | null
  status: string
  createdAt: string
  updatedAt: string
}

// 创建书籍时的输入
interface NewBook {
  title: string
  author?: string | null
  coverUrl?: string | null
  filePath?: string | null
  fileSize?: number | null
  status?: string
}
```

### ReadingProgress 相关

```typescript
interface ReadingProgress {
  id: number
  bookId: number
  userId: string
  currentLocation: string | null
  progress: number
  lastReadAt: string
}

interface NewReadingProgress {
  bookId: number
  userId: string
  currentLocation?: string | null
  progress?: number
}
```

### ChatMessage 相关

```typescript
type MessageContent =
  | string
  | Array<{ type: string; text?: string; image?: string }>

interface ChatMessage {
  id: number
  bookId: number | null
  userId: string
  role: string
  content: MessageContent
  createdAt: string
}

interface NewChatMessage {
  bookId?: number | null
  userId: string
  role: string
  content: MessageContent
}
```

### Annotation 相关

```typescript
interface Annotation {
  id: number
  bookId: number
  userId: string
  cfiRange: string
  highlightedText: string | null
  note: string | null
  color: string
  createdAt: string
}

interface NewAnnotation {
  bookId: number
  userId: string
  cfiRange: string
  highlightedText?: string | null
  note?: string | null
  color?: string
}
```

## 🎯 使用示例

### 服务端

```typescript
// apps/server/src/routes/books.ts
import type { Book, NewBook } from '@read-flow/types'

booksRoute.post('/', async (c) => {
  const body = await c.req.json() as NewBook
  
  const [newBook] = await db
    .insert(books)
    .values(body)
    .returning() // 返回类型为 Book
  
  return c.json({ book: newBook })
})
```

### 前端

```typescript
// apps/web/src/components/BookCard.tsx
import type { Book } from '@read-flow/types'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
    </div>
  )
}
```

## ✅ 优势

### 1. 类型一致性

前后端使用完全相同的类型定义，避免不匹配：

```typescript
// ✅ 前端和后端都使用相同的 Book 类型
const book: Book = await fetchBook()
```

### 2. 自动类型检查

TypeScript 编译器会检查类型错误：

```typescript
// ❌ 编译错误：类型不匹配
const book: Book = {
  id: 'string-id',  // 错误：应该是 number
  title: '书名',
}
```

### 3. IDE 智能提示

在任何地方使用 Book 类型都有完整的自动完成：

```typescript
const book: Book = {...}
book. // IDE 会提示所有可用属性
```

### 4. 重构安全

修改类型定义后，所有使用该类型的地方都会得到提示：

```typescript
// packages/types/src/book.ts
export interface Book {
  id: number
  title: string
  // 添加新字段
  isbn: string  // ← 新字段
}

// 所有使用 Book 的地方都会提示缺少 isbn 字段
```

## 🔄 添加新类型的流程

### 1. 在 Types 包中定义

```typescript
// packages/types/src/book.ts
export interface Review {
  id: number
  bookId: number
  userId: string
  rating: number
  comment: string
  createdAt: string
}

export interface NewReview {
  bookId: number
  userId: string
  rating: number
  comment?: string
}
```

### 2. 导出类型

```typescript
// packages/types/src/index.ts
export type {
  // 现有类型
  Book,
  NewBook,
  // 新类型
  Review,
  NewReview,
} from './book'
```

### 3. 在服务端创建表

```typescript
// apps/server/src/db/schema.ts
import type { Review, NewReview } from '@read-flow/types'

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id).notNull(),
  userId: text('user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type { Review, NewReview }
```

### 4. 在前端使用

```typescript
// apps/web/src/hooks/use-reviews.ts
import type { Review } from '@read-flow/types'

export function useReviews(bookId: number) {
  return useQuery<Review[]>({
    queryKey: ['reviews', bookId],
    queryFn: () => fetchReviews(bookId),
  })
}
```

## 🛠️ 最佳实践

### 1. 使用 `type` 导入

```typescript
// ✅ 推荐：明确标记为类型导入
import type { Book } from '@read-flow/types'

// ❌ 不推荐：可能导致运行时导入
import { Book } from '@read-flow/types'
```

### 2. 区分 Select 和 Insert 类型

```typescript
// ✅ 从数据库查询的数据
const book: Book = await db.select()...

// ✅ 插入数据库的数据
const newBook: NewBook = {
  title: '书名',
  author: '作者',
}
```

### 3. 保持类型与数据库一致

```typescript
// ❌ 不要在前端定义不同的类型
interface FrontendBook {
  bookId: string  // 与后端的 id 不一致
  name: string    // 与后端的 title 不一致
}

// ✅ 使用统一的类型
import type { Book } from '@read-flow/types'
```

### 4. 使用 Partial 和 Pick

```typescript
// 部分更新
type UpdateBook = Partial<NewBook>

// 只选择某些字段
type BookPreview = Pick<Book, 'id' | 'title' | 'author'>
```

## 📚 相关文档

- [Monorepo 工作区配置](../../README.md)
- [服务端数据库 Schema](../server/src/db/schema.ts)
- [前端 API Service](../web/src/service/books/index.ts)
- [TypeScript 类型导入](https://www.typescriptlang.org/docs/handbook/2/modules.html#import-type)

## 🔍 故障排查

### 问题：找不到 @read-flow/types

```bash
# 确保安装了依赖
pnpm install

# 重新构建 types 包
cd packages/types
pnpm build
```

### 问题：类型不匹配

1. 检查 `packages/types/src/book.ts` 中的类型定义
2. 确保服务端和前端使用相同版本的 types 包
3. 重启 TypeScript 服务器（VSCode: Cmd+Shift+P → TypeScript: Restart TS Server）

### 问题：修改类型后没有生效

```bash
# 清理缓存并重新构建
pnpm clean
pnpm install
pnpm build
```

