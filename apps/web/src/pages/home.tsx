import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Library, LayoutDashboard, ArrowRight } from 'lucide-react'

export function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4 py-12'>
          <h1 className='text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'>
            Read Flow
          </h1>
          <p className='text-neutral-600 dark:text-neutral-400 text-xl'>
            你的个人阅读管理平台
          </p>
        </div>

        {/* Quick Actions */}
        <div className='grid md:grid-cols-2 gap-6'>
          <Link to='/library/all'>
            <Card className='group cursor-pointer hover:shadow-lg transition-shadow h-full'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <Library className='h-8 w-8 text-purple-500' />
                  <ArrowRight className='h-5 w-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors' />
                </div>
                <CardTitle className='mt-4'>书库</CardTitle>
                <CardDescription>浏览和管理你的书籍收藏</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4 text-sm text-neutral-600 dark:text-neutral-400'>
                  <span>全部</span>
                  <span>·</span>
                  <span>正在阅读</span>
                  <span>·</span>
                  <span>已读完</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to='/dashboard'>
            <Card className='group cursor-pointer hover:shadow-lg transition-shadow h-full'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <LayoutDashboard className='h-8 w-8 text-blue-500' />
                  <ArrowRight className='h-5 w-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors' />
                </div>
                <CardTitle className='mt-4'>仪表盘</CardTitle>
                <CardDescription>查看你的阅读统计和进度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4 text-sm text-neutral-600 dark:text-neutral-400'>
                  <span>统计</span>
                  <span>·</span>
                  <span>最近阅读</span>
                  <span>·</span>
                  <span>趋势</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>功能特性</CardTitle>
            <CardDescription>强大的阅读管理工具</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3 text-sm text-neutral-700 dark:text-neutral-300'>
              <li className='flex items-center gap-2'>
                <span className='text-purple-500'>✓</span>
                <span>书籍管理 - 轻松组织和分类你的书籍</span>
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-purple-500'>✓</span>
                <span>阅读进度 - 追踪每本书的阅读状态</span>
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-purple-500'>✓</span>
                <span>统计分析 - 可视化你的阅读数据</span>
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-purple-500'>✓</span>
                <span>现代设计 - 优雅的界面和流畅的体验</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className='text-center py-8'>
          <Link to='/library/all'>
            <Button size='lg' className='gap-2'>
              开始使用
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
