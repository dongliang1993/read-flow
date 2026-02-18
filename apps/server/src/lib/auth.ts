import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'
import { env } from '../config/env'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.auth.secret,
  baseURL: env.auth.baseUrl,
  trustedOrigins: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  socialProviders: {
    google: {
      clientId: env.auth.google.clientId,
      clientSecret: env.auth.google.clientSecret,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Auth] Password reset email for ${user.email}: ${url}`)
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
})

export type Auth = typeof auth
