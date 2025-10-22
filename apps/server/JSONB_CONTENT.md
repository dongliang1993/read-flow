# JSONB Content 说明文档

## 🎯 概述

`chat_history` 表的 `content` 字段现在使用 **JSONB** 类型，可以存储完整的消息结构，包括：
- 文本内容
- 图片
- 文件
- 其他多模态内容

## 📊 数据结构

### 字符串类型（简单消息）
```json
"你好，我是 AI 助手"
```

### 数组类型（多部分消息）
```json
[
  {
    "type": "text",
    "text": "这是一段文字"
  }
]
```

### 混合内容（文本 + 图片）
```json
[
  {
    "type": "text",
    "text": "这是什么？"
  },
  {
    "type": "image",
    "image": "data:image/png;base64,..."
  },
  {
    "type": "text",
    "text": "请详细说明"
  }
]
```

## 💾 存储示例

### 在代码中存储
```typescript
// 直接存储原始 content，无需转换
await db.insert(chatHistory).values({
  bookId: bookId ? parseInt(bookId) : null,
  userId: 'default-user',
  role: lastMessage.role,
  content: lastMessage.content,  // ✅ 支持 string 或 array
})
```

### 数据库中的实际存储

**记录 1（简单文本）：**
```sql
INSERT INTO chat_history (book_id, user_id, role, content) VALUES
(1, 'user-123', 'user', '"你好"');
```

**记录 2（数组格式）：**
```sql
INSERT INTO chat_history (book_id, user_id, role, content) VALUES
(1, 'user-123', 'user', '[{"type":"text","text":"你好"}]');
```

## 🔍 查询示例

### 1. 查询所有聊天记录
```typescript
const messages = await db
  .select()
  .from(chatHistory)
  .where(eq(chatHistory.bookId, 1))

// messages[0].content 可能是字符串或数组
```

### 2. 提取文本内容
```typescript
function extractText(content: string | Array<{type: string, text?: string}>) {
  if (typeof content === 'string') {
    return content
  }
  return content
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n')
}

const text = extractText(message.content)
```

### 3. 使用 PostgreSQL JSONB 查询
```typescript
// 查询包含特定文本的消息
const results = await sql`
  SELECT * FROM chat_history
  WHERE content @> '[{"type": "text"}]'
`

// 提取所有文本部分
const texts = await sql`
  SELECT 
    id,
    jsonb_path_query_array(
      content, 
      '$[*] ? (@.type == "text").text'
    ) as texts
  FROM chat_history
`
```

## 🎨 前端使用

### 发送消息
```typescript
// 简单文本
await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '你好' }
    ]
  })
})

// 多部分消息
await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { 
        role: 'user', 
        content: [
          { type: 'text', text: '这是什么？' },
          { type: 'image', image: base64Image }
        ]
      }
    ]
  })
})
```

### 渲染消息
```typescript
function renderMessage(content: any) {
  if (typeof content === 'string') {
    return <p>{content}</p>
  }
  
  return content.map((part, i) => {
    if (part.type === 'text') {
      return <p key={i}>{part.text}</p>
    }
    if (part.type === 'image') {
      return <img key={i} src={part.image} alt="User upload" />
    }
    return null
  })
}
```

## ✅ 优势

### 1. 完整性
保留完整的消息结构，不丢失任何信息

### 2. 灵活性
支持多种内容类型，未来扩展方便

### 3. 可查询性
使用 PostgreSQL JSONB 操作符进行高效查询

### 4. 类型安全
TypeScript 类型自动推导

## 📝 JSONB vs JSON

我们使用 **JSONB** 而不是 JSON：

| 特性 | JSON | JSONB |
|------|------|-------|
| 存储格式 | 文本 | 二进制 |
| 存储速度 | 快 | 慢（需要解析） |
| 查询速度 | 慢 | 快（支持索引） |
| 空格保留 | 是 | 否 |
| 键顺序 | 保留 | 不保留 |
| **推荐** | ❌ | ✅ |

## 🚀 高级用法

### 创建索引加速查询
```sql
-- 为 content 创建 GIN 索引
CREATE INDEX idx_chat_history_content ON chat_history USING GIN (content);

-- 为文本类型内容创建索引
CREATE INDEX idx_chat_history_text ON chat_history 
USING GIN ((content -> 'text'));
```

### 全文搜索
```typescript
// 搜索包含关键词的消息
const results = await sql`
  SELECT * FROM chat_history
  WHERE content::text ILIKE '%关键词%'
`
```

### 统计消息类型
```typescript
const stats = await sql`
  SELECT 
    jsonb_array_elements(content)->>'type' as content_type,
    COUNT(*) as count
  FROM chat_history
  WHERE jsonb_typeof(content) = 'array'
  GROUP BY content_type
`
```

## 🎓 参考资源

- [PostgreSQL JSONB 文档](https://www.postgresql.org/docs/current/datatype-json.html)
- [Drizzle ORM JSONB 支持](https://orm.drizzle.team/docs/column-types/pg#jsonb)
- [JSONB 操作符](https://www.postgresql.org/docs/current/functions-json.html)

