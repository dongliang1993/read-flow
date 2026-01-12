import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

const port = env.port
console.log(`🚀 Server is running on http://localhost:${port}`)
console.log(`📝 Environment: ${env.nodeEnv}`)

serve({
  fetch: app.fetch,
  port,
})
