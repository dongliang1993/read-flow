# @read-flow/types

Read Flow 应用的共享类型定义包。

## 使用方式

在其他包中安装：

```json
{
  "dependencies": {
    "@read-flow/types": "workspace:*"
  }
}
```

导入类型：

```typescript
import type { Book } from '@read-flow/types'

const book: Book = {
  id: '1',
  title: '示例书籍',
  author: '作者',
  cover: 'https://example.com/cover.jpg',
  progress: 50,
  status: 'reading',
}
```

## 包含的类型

### Book

书籍类型定义：

```typescript
interface Book {
  id: string
  title: string
  author: string
  cover: string
  progress: number
  status: 'reading' | 'finished' | 'unread'
}
```

## 添加新类型

1. 在 `src/` 目录下创建新的类型文件
2. 在 `src/index.ts` 中导出

```typescript
// src/user.ts
export interface User {
  id: string
  name: string
}

// src/index.ts
export * from './book'
export * from './user'
```

