# Better Auth 认证系统配置指南

本项目使用 [Better Auth](https://www.better-auth.com/) 作为认证解决方案，支持 Google OAuth 登录和邮箱密码登录。

## 目录

- [环境变量配置](#环境变量配置)
- [Google OAuth 申请步骤](#google-oauth-申请步骤)
- [数据库迁移](#数据库迁移)
- [API 端点列表](#api-端点列表)
- [前端使用](#前端使用)

## 环境变量配置

在 `apps/server/.env` 文件中添加以下环境变量：

```bash
# Better Auth 配置
BETTER_AUTH_SECRET=your-random-secret-key-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 生成 BETTER_AUTH_SECRET

可以使用以下命令生成随机密钥：

```bash
openssl rand -base64 32
```

或使用 Node.js：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Google OAuth 申请步骤

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击顶部的项目选择器，然后点击 "新建项目"
3. 输入项目名称，点击 "创建"

### 2. 配置 OAuth 同意屏幕

1. 在左侧菜单中选择 "API 和服务" > "OAuth 同意屏幕"
2. 选择 "外部" 用户类型，点击 "创建"
3. 填写应用信息：
   - 应用名称：ReadFlow
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
4. 点击 "保存并继续"
5. 在 "范围" 页面，添加以下范围：
   - `email`
   - `profile`
   - `openid`
6. 完成向导

### 3. 创建 OAuth 客户端凭据

1. 在左侧菜单中选择 "API 和服务" > "凭据"
2. 点击 "创建凭据" > "OAuth 客户端 ID"
3. 应用类型选择 "Web 应用"
4. 填写：
   - 名称：ReadFlow Web Client
   - 已授权的 JavaScript 来源：
     - `http://localhost:5173`（开发环境）
   - 已授权的重定向 URI：
     - `http://localhost:3001/api/auth/callback/google`
5. 点击 "创建"
6. 复制 "客户端 ID" 和 "客户端密钥"，填入环境变量

## 数据库迁移

Better Auth 需要以下数据库表：

- `user` - 用户基本信息
- `session` - 登录会话
- `account` - OAuth 账号关联
- `verification` - 密码重置验证

### 生成迁移文件

```bash
cd apps/server
pnpm db:generate
```

### 应用迁移

```bash
pnpm db:migrate
```

### 或直接推送到数据库（开发环境）

```bash
pnpm db:push
```

## API 端点列表

Better Auth 自动处理以下端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/sign-up/email` | POST | 邮箱注册 |
| `/api/auth/sign-in/email` | POST | 邮箱登录 |
| `/api/auth/sign-in/social` | POST | 社交登录（Google） |
| `/api/auth/sign-out` | POST | 登出 |
| `/api/auth/session` | GET | 获取当前会话 |
| `/api/auth/forget-password` | POST | 忘记密码 |
| `/api/auth/reset-password` | POST | 重置密码 |
| `/api/auth/callback/google` | GET | Google OAuth 回调 |

### 自定义端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/session` | GET | 获取当前用户和会话信息 |

## 前端使用

### 登录页面

访问 `/auth/login` 进行登录，支持：
- Google OAuth 登录
- 邮箱密码登录

### 注册页面

访问 `/auth/register` 进行注册

### 忘记密码

访问 `/auth/forgot-password` 发送密码重置邮件

### 重置密码

点击邮件中的链接跳转到 `/auth/reset-password?token=xxx` 重置密码

### 在组件中使用

```typescript
import { useSession, signOut } from '@/lib/auth-client'

function UserProfile() {
  const { data: session, isPending } = useSession()

  if (isPending) return <div>Loading...</div>

  if (!session) {
    return <a href="/auth/login">请登录</a>
  }

  return (
    <div>
      <p>欢迎, {session.user.name}</p>
      <button onClick={() => signOut()}>登出</button>
    </div>
  )
}
```

## 注意事项

1. **生产环境**：确保使用 HTTPS 并更新所有 URL
2. **CORS**：已配置允许 `http://localhost:5173` 访问
3. **Cookie**：认证使用 httpOnly cookie，自动处理
4. **密码重置邮件**：当前仅在控制台打印链接，生产环境需配置邮件服务

## 相关文件

- 后端配置：`apps/server/src/lib/auth.ts`
- 数据库表：`apps/server/src/db/schema.ts`
- 前端客户端：`apps/web/src/lib/auth-client.ts`
- 登录页面：`apps/web/src/pages/auth/`

