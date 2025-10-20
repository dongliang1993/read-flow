# Read Flow Server

Hono 服务器，提供 API 服务。

## 端点

### Chat API

#### POST `/api/v1/chat`

AI 聊天接口，支持流式响应。

**请求体：**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "请总结这一章的内容"
    }
  ],
  "bookId": "1",
  "context": "当前页面的文本内容...",
  "model": "gpt-4"
}
```

**参数说明：**

- `messages` (必需): 消息数组，包含历史对话
  - `role`: 消息角色 - `user`, `assistant`, 或 `system`
  - `content`: 消息内容
- `bookId` (可选): 当前书籍 ID
- `context` (可选): 当前页面上下文
- `model` (可选): 使用的 AI 模型

**响应：**

Server-Sent Events (SSE) 流式响应：

```
data: {"role":"assistant","content":"收","done":false}

data: {"role":"assistant","content":"到","done":false}

data: {"done":true}

data: [DONE]
```

#### GET `/api/v1/chat/health`

健康检查接口。

**响应：**

```json
{
  "status": "ok",
  "service": "chat",
  "timestamp": "2025-10-17T10:00:00.000Z"
}
```

## 开发

### 启动服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3001 启动。

### 测试 Chat API

使用 curl 测试：

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "bookId": "1"
  }'
```

## 集成 AI 服务

当前实现是模拟响应。要集成真实的 AI 服务，需要：

1. 安装 AI SDK：

```bash
pnpm add ai @ai-sdk/openai
# 或其他提供商
```

2. 在 `routes/chat.ts` 中实现真实的 AI 调用：

```typescript
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// 在路由处理中
const result = await streamText({
  model: openai('gpt-4'),
  messages: messages,
})

return result.toTextStreamResponse()
```

## 环境变量

创建 `.env` 文件：

```env
OPENAI_API_KEY=your_api_key
GEMINI_API_KEY=your_api_key
PORT=3001
```

