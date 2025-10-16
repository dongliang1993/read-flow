import { useState, useEffect } from 'react'
import { mockBooks } from '../data/books'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { BookOpen, CheckCircle2, TrendingUp, Clock } from 'lucide-react'

export function Dashboard() {
  const [message, setMessage] = useState<string>('正在连接服务器...')

  useEffect(() => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('无法连接到服务器'))
  }, [])

  const stats = {
    total: mockBooks.length,
    reading: mockBooks.filter((b) => b.status === 'reading').length,
    finished: mockBooks.filter((b) => b.status === 'finished').length,
    unread: mockBooks.filter((b) => b.status === 'unread').length,
  }

  const recentBooks = mockBooks
    .filter((b) => b.status === 'reading')
    .slice(0, 4)

  return (
    <div className='p-8 space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-4xl font-bold text-neutral-900 dark:text-neutral-100'>
          仪表盘
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          欢迎回来，查看你的阅读统计
        </p>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle>服务器状态</CardTitle>
          <CardDescription>来自 Hono 后端的实时消息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
            <code className='text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-md text-neutral-800 dark:text-neutral-200'>
              {message}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总计书籍</CardTitle>
            <BookOpen className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
              {stats.total}
            </div>
            <p className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
              书库中的全部书籍
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>正在阅读</CardTitle>
            <Clock className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
              {stats.reading}
            </div>
            <p className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
              正在进行中的书籍
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>已读完</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
              {stats.finished}
            </div>
            <p className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
              完成阅读的书籍
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>待阅读</CardTitle>
            <TrendingUp className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
              {stats.unread}
            </div>
            <p className='text-xs text-neutral-500 dark:text-neutral-400 mt-1'>
              尚未开始的书籍
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reading */}
      <Card>
        <CardHeader>
          <CardTitle>最近阅读</CardTitle>
          <CardDescription>继续你的阅读之旅</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBooks.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {recentBooks.map((book) => (
                <div key={book.id} className='group cursor-pointer space-y-2'>
                  <div className='aspect-[3/4] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow'>
                    <img
                      src={book.cover}
                      alt={book.title}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate'>
                      {book.title}
                    </h3>
                    <p className='text-xs text-neutral-500 dark:text-neutral-500 truncate'>
                      {book.author}
                    </p>
                    <div className='mt-2'>
                      <div className='h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-500 transition-all'
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <p className='text-xs text-neutral-500 dark:text-neutral-500 mt-1'>
                        {book.progress}% 完成
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-10 text-neutral-500 dark:text-neutral-400'>
              暂无正在阅读的书籍
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
