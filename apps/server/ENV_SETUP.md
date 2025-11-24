# 环境变量配置指南

## 📋 必需的环境变量

在 `apps/server/` 目录下创建 `.env` 文件，并添加以下配置：

```env
# 服务器配置
NODE_ENV=development
PORT=3001

# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# Supabase 数据库配置
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage 配置
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

## 🔑 获取 Supabase 配置

### 1. SUPABASE_URL

在 Supabase Dashboard 中：
```
1. 打开你的项目
2. 点击 Settings → API
3. 找到 "Project URL"
4. 复制 URL
```

### 2. SUPABASE_SERVICE_KEY

**重要：这是服务端密钥，绝不能暴露给前端！**

```
1. 打开你的项目
2. 点击 Settings → API
3. 找到 "Project API keys" 部分
4. 复制 "service_role" key（不是 anon key！）
```

### 3. DATABASE_URL

```
1. 打开你的项目
2. 点击 Settings → Database
3. 找到 "Connection string" → "URI"
4. 选择 "Session mode"
5. 复制连接字符串
6. 将 [YOUR-PASSWORD] 替换为你的数据库密码
```

## 📦 创建 Supabase Storage Bucket

在使用上传功能之前，需要创建存储桶：

```
1. 打开 Supabase Dashboard
2. 左侧菜单选择 "Storage"
3. 点击 "Create bucket"
4. 名称：books
5. 选择 Public 或 Private（根据需求）
   - Public: 文件可直接通过 URL 访问
   - Private: 需要签名 URL 才能访问（更安全）
6. 点击 "Create bucket"
```

### Bucket 权限设置（可选）

如果选择 Private bucket，可以设置 RLS 策略：

```sql
-- 允许所有人读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'books');

-- 只允许认证用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');
```

## 🧪 验证配置

创建 `.env` 文件后，运行以下命令验证：

```bash
# 检查环境变量是否加载
cd apps/server
pnpm dev

# 应该看到类似输出：
# 🚀 Server is running on http://localhost:3001
# 📝 Environment: development
```

## ⚠️ 安全提示

1. **.env 文件已被 .gitignore**
   - 绝不要提交 .env 文件到 Git
   - Service Key 泄露会导致严重安全问题

2. **生产环境**
   - 使用环境变量而不是 .env 文件
   - 使用密钥管理服务（如 AWS Secrets Manager）

3. **开发团队**
   - 每个开发者使用自己的 Supabase 项目
   - 或共享一个开发环境项目（不要共享生产密钥）

## 📚 相关文档

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [环境变量最佳实践](https://12factor.net/config)

