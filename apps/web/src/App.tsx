import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Switch } from './components/ui/switch'

function App() {
  const [message, setMessage] = useState<string>('正在连接服务器...')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('无法连接到服务器'))
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'>
            React + Hono Monorepo
          </h1>
          <p className='text-muted-foreground text-lg'>
            集成 Tailwind CSS 和 Radix UI 的现代化全栈模板
          </p>

          {/* Dark Mode Toggle */}
          <div className='flex items-center justify-center gap-3 pt-2'>
            <span className='text-sm text-muted-foreground'>浅色模式</span>
            <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
            <span className='text-sm text-muted-foreground'>深色模式</span>
          </div>
        </div>

        {/* Server Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>服务器状态</CardTitle>
            <CardDescription>来自 Hono 后端的实时消息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
              <code className='text-sm bg-muted px-3 py-1 rounded-md'>
                {message}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Demo */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='overview'>概览</TabsTrigger>
            <TabsTrigger value='features'>功能</TabsTrigger>
            <TabsTrigger value='demo'>演示</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>项目概览</CardTitle>
                <CardDescription>这是一个现代化的全栈开发模板</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>前端:</span>
                  <span className='text-sm text-muted-foreground'>
                    React 18 + Vite + TypeScript
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>后端:</span>
                  <span className='text-sm text-muted-foreground'>
                    Hono + Node.js
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>UI:</span>
                  <span className='text-sm text-muted-foreground'>
                    Tailwind CSS + Radix UI
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>构建:</span>
                  <span className='text-sm text-muted-foreground'>
                    pnpm + Turborepo
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='features' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>核心功能</CardTitle>
                <CardDescription>开箱即用的强大特性</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>Monorepo 架构，统一管理前后端</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>TypeScript 全栈类型安全</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>Tailwind CSS 原子化样式</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>Radix UI 无障碍组件库</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>浅色/深色主题切换</span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='text-primary'>✓</span>
                    <span>Vite 极速热更新</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='demo' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>交互演示</CardTitle>
                <CardDescription>测试 Radix UI 组件的交互效果</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>计数器: {count}</span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setCount(count - 1)}
                    >
                      -1
                    </Button>
                    <Button onClick={() => setCount(count + 1)}>+1</Button>
                    <Button variant='secondary' onClick={() => setCount(0)}>
                      重置
                    </Button>
                  </div>
                </div>
                <div className='pt-4 border-t'>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button variant='default'>默认按钮</Button>
                    <Button variant='secondary'>次要按钮</Button>
                    <Button variant='outline'>边框按钮</Button>
                    <Button variant='ghost'>幽灵按钮</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='text-xs text-muted-foreground'>
                所有组件均基于 Radix UI 构建，支持键盘导航和屏幕阅读器
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-center text-muted-foreground'>
              编辑{' '}
              <code className='bg-muted px-2 py-1 rounded text-xs'>
                apps/web/src/App.tsx
              </code>{' '}
              或{' '}
              <code className='bg-muted px-2 py-1 rounded text-xs'>
                apps/server/src/index.ts
              </code>{' '}
              开始开发
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
