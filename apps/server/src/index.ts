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
import { env } from './config/env'

import { errorHandler } from './middlewares/error-handler'

const app = new Hono()

app.use('/*', cors())
app.use('*', logger())
app.use('*', prettyJSON())

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

app.route('/api/v1/chat', chat)
app.route('/api/v1/books', books)
app.route('/api/v1/summarize', summarize)
app.route('/api/v1/reading-session', readingSession)
app.route('/api/v1/reading-stats', readingStats)
app.route('/api/v1/progress', progress)

const port = env.port
console.log(`🚀 Server is running on http://localhost:${port}`)
console.log(`📝 Environment: ${env.nodeEnv}`)

// Error handler
app.onError(errorHandler)

serve({
  fetch: app.fetch,
  port,
})
