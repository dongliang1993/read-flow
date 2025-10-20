import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import chat from './routes/chat'
import { env } from './config/env'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.json({
    message: 'Read Flow API Server',
    version: '1.0.0',
    endpoints: {
      chat: '/api/v1/chat',
      health: '/api/v1/chat/health',
    },
  })
})

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

app.route('/api/v1/chat', chat)

const port = env.port
console.log(`🚀 Server is running on http://localhost:${port}`)
console.log(`📝 Environment: ${env.nodeEnv}`)

serve({
  fetch: app.fetch,
  port,
})
