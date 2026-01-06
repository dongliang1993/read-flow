import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { user } from '../db/schema'
import modelsConfig from '@read-flow/shared/data/models-config'

import type { ProviderConfig } from '@read-flow/shared/types'

type Variables = {
  user: { id: string } | null
}

const settingsRoute = new Hono<{ Variables: Variables }>()

/**
 * 获取当前用户的 provider 设置（合并默认配置）
 * GET /api/v1/settings/providers
 */
settingsRoute.get('/providers', async (c) => {
  const currentUser = c.get('user')

  if (!currentUser) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const [dbUser] = await db
      .select({ providerSettings: user.providerSettings })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1)

    const userSettings = (dbUser?.providerSettings as ProviderConfig[]) || []
    const settingsMap = new Map(userSettings.map((p) => [p.id, p]))

    const mergedProviders: ProviderConfig[] = (
      modelsConfig as ProviderConfig[]
    ).map((defaultProvider) => {
      const userProvider = settingsMap.get(defaultProvider.id)

      if (!userProvider) {
        return defaultProvider
      }

      return {
        ...defaultProvider,
        apiKey: userProvider.apiKey || defaultProvider.apiKey,
        baseURL: userProvider.baseURL || defaultProvider.baseURL,
        models: defaultProvider.models.map((model) => {
          const userModel = userProvider.models?.find((m) => m.id === model.id)
          return {
            ...model,
            enabled: userModel?.enabled ?? model.enabled,
          }
        }),
      }
    })

    return c.json({ providers: mergedProviders })
  } catch (error) {
    console.error('Get provider settings error:', error)
    return c.json({ error: 'Failed to fetch provider settings' }, 500)
  }
})

/**
 * 保存用户的 provider 设置
 * PUT /api/v1/settings/providers
 */
settingsRoute.put('/providers', async (c) => {
  const currentUser = c.get('user')

  if (!currentUser) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await c.req.json<{ providers: ProviderConfig[] }>()
    const { providers } = body

    if (!providers || !Array.isArray(providers)) {
      return c.json({ error: 'Invalid request body' }, 400)
    }

    await db
      .update(user)
      .set({
        providerSettings: providers,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))

    return c.json({ success: true })
  } catch (error) {
    console.error('Save provider settings error:', error)
    return c.json({ error: 'Failed to save provider settings' }, 500)
  }
})

export default settingsRoute
