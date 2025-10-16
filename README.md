# Read Flow

一个基于 React + Hono + pnpm + Turborepo 的 Monorepo 模板，集成了 Tailwind CSS 和 Radix UI 的现代化阅读管理应用。

## 📦 项目结构

```
read-flow/
├── apps/
│   ├── web/          # React 前端应用 (Vite + Tailwind CSS + Radix UI)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/     # 布局组件（侧边栏等）
│   │   │   │   ├── library/    # 书库相关组件
│   │   │   │   └── ui/         # UI 基础组件
│   │   │   ├── pages/          # 页面组件
│   │   │   ├── data/           # 模拟数据
│   │   │   └── lib/            # 工具函数
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

## 📱 应用功能

### 主要页面

#### 🏠 主页
- 欢迎页面，快速导航到书库和仪表盘
- 功能特性介绍

#### 📚 书库
- **全部** - 显示所有书籍
- **正在阅读** - 筛选正在阅读的书籍
- **已读完** - 显示已完成阅读的书籍
- 书籍卡片展示，包含封面、标题、作者和阅读进度

#### 📊 仪表盘
- 阅读统计概览（总计、正在阅读、已读完、待阅读）
- 服务器状态监控
- 最近阅读的书籍
- 可视化进度条

### UI 组件

已集成并封装的 Radix UI 组件：
- ✓ Button（按钮）- 多种样式变体
- ✓ Card（卡片）- 完整的卡片组件系统
- ✓ Tabs（标签页）- 可访问的标签页组件
- ✓ Switch（开关）- 切换开关组件

### 布局特性

- ✓ 左侧导航栏 - 固定侧边栏导航
- ✓ 响应式布局 - 适配各种屏幕尺寸
- ✓ 深色模式支持 - CSS 变量主题系统
- ✓ 路由导航 - React Router v6
- ✓ Lucide 图标 - 现代化图标库

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **路由**: React Router v6
- **图标**: Lucide React
- **开发端口**: 3000

### 后端
- **框架**: Hono + TypeScript
- **运行时**: Node.js
- **开发端口**: 3001

### 工具链
- **Monorepo**: pnpm workspaces + Turborepo
- **包管理器**: pnpm
- **类型检查**: TypeScript

## ✨ 功能特性

### 样式系统
- ✓ Tailwind CSS - 原子化 CSS 框架
- ✓ 深色模式支持 - 开箱即用的主题切换
- ✓ CSS 变量系统 - 易于自定义的设计令牌
- ✓ 响应式设计 - 移动端优先
- ✓ Neutral 色系 - 统一的中性色调

### 开发体验
- ✓ TypeScript 全栈类型安全
- ✓ 热模块替换（HMR）
- ✓ Turborepo 构建缓存
- ✓ 组件复用和扩展
- ✓ ESLint + Prettier（可选）

### 数据管理
- ✓ 模拟书籍数据
- ✓ 状态管理（通过 React state）
- ✓ API 集成示例

## 🎨 自定义主题

编辑 `apps/web/src/index.css` 中的 CSS 变量来自定义主题颜色：

```css
:root {
  --primary: 262.1 83.3% 57.8%;
  --secondary: 210 40% 96.1%;
  /* ... 更多颜色变量 */
}
```

## 📝 API 路由

后端提供的 API 接口：

- `GET /` - 根路由
- `GET /api` - API 健康检查
- `GET /api/hello/:name` - 示例参数路由

前端通过 Vite 代理配置访问后端 API。

## 🗺️ 路由结构

```
/                      # 主页
/library/all           # 书库 - 全部
/library/reading       # 书库 - 正在阅读
/library/finished      # 书库 - 已读完
/dashboard            # 仪表盘
```

## 📖 开发建议

1. 每个应用都有独立的 `package.json` 和 `tsconfig.json`
2. 使用 Turborepo 来管理构建缓存和任务编排
3. 前端的 Vite 配置已经设置了 API 代理，可以直接调用 `/api` 路由
4. 后端已启用 CORS，方便开发调试
5. 使用 `cn()` 工具函数来合并 Tailwind 类名
6. 所有 Radix UI 组件都支持键盘导航和屏幕阅读器
7. 遵循组件化开发，保持代码的可维护性

## 🚧 后续开发建议

- [ ] 添加用户认证和授权
- [ ] 实现真实的后端数据存储
- [ ] 添加书籍搜索和过滤功能
- [ ] 实现阅读笔记和标注功能
- [ ] 添加书籍导入/导出功能
- [ ] 集成电子书阅读器
- [ ] 添加阅读统计图表
- [ ] 实现书籍推荐系统

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
