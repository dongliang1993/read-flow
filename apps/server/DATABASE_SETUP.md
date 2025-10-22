# 数据库设置指南

## 概述

本项目使用 **Drizzle ORM + Supabase PostgreSQL** 作为数据库解决方案。

## 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 记录数据库密码（在创建项目时设置）

## 2. 获取数据库连接字符串

在 Supabase Dashboard 中：

```
Project Settings → Database → Connection string → URI
```

复制 **Session mode** 的连接字符串：
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 3. 配置环境变量

在 `apps/server/` 目录下创建 `.env` 文件：

```env
NODE_ENV=development
PORT=3001

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 4. 推送数据库 Schema

```bash
cd apps/server

# 推送 schema 到 Supabase
pnpm db:push
```

## 5. 可用的数据库命令

```bash
# 生成迁移文件（基于 schema.ts）
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送 schema 到数据库（开发环境推荐）
pnpm db:push

# 打开 Drizzle Studio（可视化数据库管理）
pnpm db:studio
```

## 6. 数据库表结构

### books（书籍表）
- `id` - 主键
- `title` - 书名
- `author` - 作者
- `coverUrl` - 封面 URL
- `filePath` - 文件路径
- `fileSize` - 文件大小
- `status` - 状态（unread/reading/finished）
- `createdAt` - 创建时间
- `updatedAt` - 更新时间

### readingProgress（阅读进度表）
- `id` - 主键
- `bookId` - 书籍 ID（外键）
- `userId` - 用户 ID
- `currentLocation` - 当前位置（EPUB CFI）
- `progress` - 进度百分比（0-100）
- `lastReadAt` - 最后阅读时间

### chatHistory（聊天历史表）
- `id` - 主键
- `bookId` - 书籍 ID（外键）
- `userId` - 用户 ID
- `role` - 角色（user/assistant）
- `content` - 内容
- `createdAt` - 创建时间

### annotations（标注表）
- `id` - 主键
- `bookId` - 书籍 ID（外键）
- `userId` - 用户 ID
- `cfiRange` - CFI 范围
- `highlightedText` - 高亮文本
- `note` - 笔记
- `color` - 颜色
- `createdAt` - 创建时间

## 7. API 端点

### Books API (`/api/v1/books`)

- `GET /` - 获取所有书籍
- `GET /:id` - 获取单本书籍
- `POST /` - 创建新书籍
- `PUT /:id` - 更新书籍信息
- `DELETE /:id` - 删除书籍
- `GET /:id/progress` - 获取阅读进度
- `PUT /:id/progress` - 更新阅读进度

### Chat API (`/api/v1/chat`)

- `POST /` - 发送聊天消息（自动保存到数据库）
- `GET /history/:bookId` - 获取聊天历史

## 8. 使用示例

### 创建书籍

```bash
curl -X POST http://localhost:3001/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "人类简史",
    "author": "尤瓦尔·赫拉利",
    "coverUrl": "https://example.com/cover.jpg"
  }'
```

### 更新阅读进度

```bash
curl -X PUT http://localhost:3001/api/v1/books/1/progress \
  -H "Content-Type: application/json" \
  -d '{
    "location": "epubcfi(/6/4[chap01ref]!/4/2/2[id_1])",
    "progress": 25
  }'
```

### 获取聊天历史

```bash
curl http://localhost:3001/api/v1/chat/history/1
```

## 9. Drizzle Studio

运行以下命令打开可视化数据库管理界面：

```bash
pnpm db:studio
```

访问 `https://local.drizzle.studio` 即可查看和管理数据库。

## 10. 下一步

- ✅ 数据库已配置完成
- ✅ API 路由已创建
- ⏳ 前端集成（使用新的 API）
- ⏳ 用户认证（可选：集成 Supabase Auth）
- ⏳ 文件存储（可选：集成 Supabase Storage）

## 常见问题

### Q: 如何查看数据库中的数据？
A: 运行 `pnpm db:studio` 或直接在 Supabase Dashboard 中查看。

### Q: 如何修改数据库结构？
A: 修改 `src/db/schema.ts` 文件，然后运行 `pnpm db:push`。

### Q: 开发环境用 `db:push` 还是 `db:migrate`？
A: 开发环境推荐用 `db:push`（快速原型），生产环境使用 `db:migrate`（版本控制）。

### Q: 如何重置数据库？
A: 在 Supabase Dashboard 中删除所有表，然后重新运行 `pnpm db:push`。

