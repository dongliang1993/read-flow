# Read Flow

一个基于 React + Hono + pnpm + Turborepo 的 Monorepo 模板，集成了 Tailwind CSS 和 Radix UI。

## 📦 项目结构

```
read-flow/
├── apps/
│   ├── web/          # React 前端应用 (Vite + Tailwind CSS + Radix UI)
│   └── server/       # Hono 后端服务
├── package.json      # 根 package.json
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo 配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

如果还没有安装 pnpm，可以运行：

```bash
npm install -g pnpm
```

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm dev
```

这将同时启动：
- 前端开发服务器: http://localhost:3000
- 后端 API 服务器: http://localhost:3001

### 构建生产版本

```bash
pnpm build
```

### 清理构建产物

```bash
pnpm clean
```

## 📱 应用说明

### Web (前端)

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **开发端口**: 3000
- **API 代理**: `/api` 会被代理到 `http://localhost:3001`

主要文件：
- `apps/web/src/App.tsx` - 主应用组件
- `apps/web/src/components/ui/` - Radix UI 组件封装
- `apps/web/tailwind.config.js` - Tailwind 配置
- `apps/web/vite.config.ts` - Vite 配置

### Server (后端)

- **框架**: Hono
- **运行时**: Node.js
- **开发端口**: 3001

主要文件：
- `apps/server/src/index.ts` - 服务器入口

API 路由：
- `GET /` - 根路由
- `GET /api` - API 健康检查
- `GET /api/hello/:name` - 示例参数路由

## 🛠️ 技术栈

- **Monorepo**: pnpm workspaces + Turborepo
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **后端**: Hono + TypeScript
- **包管理器**: pnpm

## ✨ 功能特性

### UI 组件库

已集成并封装的 Radix UI 组件：
- ✓ Button（按钮）- 多种样式变体
- ✓ Card（卡片）- 完整的卡片组件系统
- ✓ Tabs（标签页）- 可访问的标签页组件
- ✓ Switch（开关）- 切换开关组件

### 样式系统

- ✓ Tailwind CSS - 原子化 CSS 框架
- ✓ 深色模式支持 - 开箱即用的主题切换
- ✓ CSS 变量系统 - 易于自定义的设计令牌
- ✓ 响应式设计 - 移动端优先

### 开发体验

- ✓ TypeScript 全栈类型安全
- ✓ 热模块替换（HMR）
- ✓ Turborepo 构建缓存
- ✓ 组件复用和扩展

## 🎨 自定义主题

编辑 `apps/web/src/index.css` 中的 CSS 变量来自定义主题颜色：

```css
:root {
  --primary: 262.1 83.3% 57.8%;
  --secondary: 210 40% 96.1%;
  /* ... 更多颜色变量 */
}
```

## 📝 开发建议

1. 每个应用都有独立的 `package.json` 和 `tsconfig.json`
2. 使用 Turborepo 来管理构建缓存和任务编排
3. 前端的 Vite 配置已经设置了 API 代理，可以直接调用 `/api` 路由
4. 后端已启用 CORS，方便开发调试
5. 使用 `cn()` 工具函数来合并 Tailwind 类名
6. 所有 Radix UI 组件都支持键盘导航和屏幕阅读器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
