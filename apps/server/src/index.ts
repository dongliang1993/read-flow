import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'

import chat from './routes/chat'
import books from './routes/books'
import summarize from './routes/summarize'
import readingSession from './routes/reading-session'
import readingStats from './routes/reading-stats'
import progress from './routes/progress'
import note from './routes/note'
import modes from './routes/modes'
import settings from './routes/settings'
import credits from './routes/credits'
import { env } from './config/env'

import { loadAllTools } from './lib/ai/tools'
import { errorHandler } from './middlewares/error-handler'
// import { initJobSystem } from './jobs'
import { auth } from './lib/auth'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()

app.use(
  '/api/auth/*',
  cors({
    origin: 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)

app.use(
  '/*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use('*', logger())
app.use('*', prettyJSON())

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api', (c) => {
  return c.json({
    message: 'Hono 服务器运行正常！',
    timestamp: new Date().toISOString(),
  })
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.get('/api/session', (c) => {
  const session = c.get('session')
  const user = c.get('user')

  if (!user) return c.body(null, 401)

  return c.json({ session, user })
})

app.route('/api/v1/chat', chat)
app.route('/api/v1/books', books)
app.route('/api/v1/summarize', summarize)
app.route('/api/v1/reading-session', readingSession)
app.route('/api/v1/reading-stats', readingStats)
app.route('/api/v1/progress', progress)
app.route('/api/v1/note', note)
app.route('/api/v1/modes', modes)
app.route('/api/v1/settings', settings)
app.route('/api/v1/credits', credits)

const port = env.port
console.log(`🚀 Server is running on http://localhost:${port}`)
console.log(`📝 Environment: ${env.nodeEnv}`)

// Error handler
app.onError(errorHandler)

// 初始化 Job 系统
// initJobSystem({
//   pollInterval: 5000, // 5 秒轮询一次
//   concurrency: 2, // 同时处理 2 个任务
// })

// console.log('📋 Job system initialized')
loadAllTools()

serve({
  fetch: app.fetch,
  port,
})
