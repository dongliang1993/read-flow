import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 启用 CORS
app.use('/*', cors())

// 根路由
app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono! 你好，来自 Hono 服务器！' })
})

// API 路由
app.get('/api', (c) => {
  return c.json({
    message: 'Hono 服务器运行正常！',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.json({ message: `你好, ${name}!` })
})

const port = 3001
console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
