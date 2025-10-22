# VSCode 调试指南

## 🎯 快速开始

### 方式 1：使用 VSCode 调试面板（推荐）

1. **打开调试面板**
   - 按 `Cmd + Shift + D` (macOS) 或 `Ctrl + Shift + D` (Windows/Linux)
   - 或点击左侧活动栏的调试图标

2. **选择调试配置**
   - 在顶部下拉菜单中选择 "调试 Server (tsx)"

3. **设置断点**
   - 在代码行号左侧点击，设置红色断点
   - 例如在 `apps/server/src/routes/chat.ts` 的第 50 行设置断点

4. **开始调试**
   - 点击绿色的播放按钮，或按 `F5`
   - 服务器会启动并等待请求

5. **触发断点**
   - 在浏览器或 Postman 中发送请求到 `http://localhost:3001/api/v1/chat`
   - 代码会在断点处暂停

6. **调试操作**
   - `F10` - 单步跳过（Step Over）
   - `F11` - 单步进入（Step Into）
   - `Shift + F11` - 单步跳出（Step Out）
   - `F5` - 继续（Continue）
   - 悬停在变量上查看值
   - 在调试控制台中输入表达式

---

## 📋 可用的调试配置

### 1. 调试 Server (推荐)
使用 pnpm 启动整个 server 项目
```
配置名：调试 Server
适用：完整项目调试
支持：热重载
```

### 2. 调试 Server (tsx)
直接使用 tsx 运行，更快速
```
配置名：调试 Server (tsx)
适用：快速调试和开发
支持：热重载、自动重启
```

### 3. 调试当前 TS 文件
调试你当前打开的 TypeScript 文件
```
配置名：调试当前 TS 文件
适用：调试单个脚本或测试文件
使用：打开文件后按 F5
```

### 4. 附加到运行中的进程
附加到已经运行的 Node.js 进程
```
配置名：附加到运行中的进程
适用：调试已启动的服务器
需要：服务器以调试模式运行
```

---

## 🔧 常见调试场景

### 场景 1：调试 API 路由

```typescript
// apps/server/src/routes/chat.ts
chat.post('/', async (c) => {
  try {
    const body = await c.req.json()
    debugger; // ← 在这里设置断点
    
    const { messages, bookId } = body
    // ... 代码继续
```

**步骤：**
1. 在想要调试的行设置断点
2. 按 F5 启动调试
3. 使用 curl 或前端发送请求
4. 代码会在断点处暂停

### 场景 2：调试数据库操作

```typescript
// apps/server/src/routes/books.ts
booksRoute.get('/', async (c) => {
  try {
    debugger; // ← 断点
    const allBooks = await db.select().from(books)
    // 检查 allBooks 的值
    return c.json({ books: allBooks })
```

### 场景 3：调试环境变量

```typescript
// apps/server/src/config/env.ts
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  database: {
    url: process.env.DATABASE_URL || '', // ← 在这里设置断点检查值
  },
}
```

---

## 💡 调试技巧

### 1. 使用调试控制台
调试暂停时，在 DEBUG CONSOLE 中输入：
```javascript
// 查看变量
console.log(bookId)

// 执行表达式
messages.length

// 测试条件
bookId ? parseInt(bookId) : null
```

### 2. 监视表达式
在 WATCH 面板中添加：
```
messages.length
bookId
env.database.url
lastMessage.content
```

### 3. 条件断点
右键点击断点 → 编辑断点 → 添加条件：
```javascript
bookId === '1'
messages.length > 5
```

### 4. 日志点（Logpoint）
右键点击断点 → 选择 "添加日志点"：
```javascript
Book ID: {bookId}, Messages: {messages.length}
```

---

## 🐛 常见问题

### Q: 断点变成灰色，不会命中
**A:** 检查以下几点：
1. 确保使用了正确的调试配置（tsx）
2. 确认 `sourceMaps: true` 已启用
3. 重启调试会话

### Q: 无法查看变量值
**A:** 
1. 确保代码已执行到断点
2. 变量可能在当前作用域外
3. 尝试在调试控制台中手动输入变量名

### Q: 修改代码后需要重新调试吗？
**A:** 不需要！使用 "调试 Server (tsx)" 配置支持热重载，代码修改后会自动重启。

### Q: 如何调试异步代码？
**A:** 
1. 在 `await` 语句前设置断点
2. 使用 F11 进入异步函数内部
3. 查看 Promise 状态和返回值

---

## 🚀 高级用法

### 以调试模式启动（手动）

如果你想手动启动调试：

```bash
# 方式 1：使用 tsx 的调试模式
cd apps/server
npx tsx --inspect=9229 src/index.ts

# 方式 2：使用 node 的调试模式
cd apps/server
node --inspect=9229 dist/index.js

# 然后使用 "附加到运行中的进程" 配置
```

### 调试测试

如果你添加了测试：

```bash
# 添加到 package.json
"scripts": {
  "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
}
```

---

## 📚 快捷键速查

| 操作 | macOS | Windows/Linux |
|------|-------|---------------|
| 开始调试 | `F5` | `F5` |
| 停止调试 | `Shift + F5` | `Shift + F5` |
| 重启调试 | `Cmd + Shift + F5` | `Ctrl + Shift + F5` |
| 单步跳过 | `F10` | `F10` |
| 单步进入 | `F11` | `F11` |
| 单步跳出 | `Shift + F11` | `Shift + F11` |
| 继续执行 | `F5` | `F5` |
| 切换断点 | `F9` | `F9` |
| 打开调试面板 | `Cmd + Shift + D` | `Ctrl + Shift + D` |

---

## 🎯 推荐工作流

1. **设置断点** → 在关键代码行设置
2. **启动调试** → 按 F5
3. **发送请求** → 触发代码执行
4. **逐步调试** → 使用 F10/F11 查看执行流程
5. **检查变量** → 悬停或使用 WATCH 面板
6. **修复问题** → 修改代码（自动重载）
7. **再次测试** → 验证修复

Happy Debugging! 🐛✨

