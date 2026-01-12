import {
  parseModelIdentifier,
  resolveProviderModelName,
  createProviders,
  type ProviderFactory,
} from '@read-flow/shared/providers/core/provider-utils'
import modelsDefault from '@read-flow/shared/data/models-config'
import { db } from '../../db'
import { user as userTable } from '../../db/schema'
import { eq } from 'drizzle-orm'

import type { ModelConfig, ProviderConfig } from '@read-flow/shared'

type UserProviderCache = {
  providers: Map<string, ProviderFactory>
  modelConfigs: Record<string, ModelConfig>
  updatedAt: number
}

// 全局用户 Provider 缓存
const USER_PROVIDER_CACHE = new Map<string, UserProviderCache>()

// 缓存过期时间（1小时）
const CACHE_TTL = 60 * 60 * 1000

class ProviderService {
  private modelConfigs: Record<string, ModelConfig>
  private providers: Map<string, ProviderFactory>
  private providerConfigs: Map<string, ProviderConfig>

  constructor() {
    this.providers = new Map<string, ProviderFactory>()
    this.providerConfigs = new Map<string, ProviderConfig>()
    this.modelConfigs = {} as Record<string, ModelConfig>

    this.initialize()
  }

  async initialize() {
    let modelConfigs: Record<string, ModelConfig> = {}
    let providerConfigs: Map<string, ProviderConfig> = new Map()

    for (const provider of modelsDefault) {
      providerConfigs.set(provider.id, provider as ProviderConfig)

      for (const model of provider.models) {
        modelConfigs[model.id] = model
      }
    }

    this.modelConfigs = modelConfigs
    this.providers = createProviders(providerConfigs)
    this.providerConfigs = providerConfigs
  }

  /**
   * 获取或创建用户的 provider 缓存
   */
  private async getOrCreateUserCache(
    userId: string
  ): Promise<UserProviderCache> {
    const now = Date.now()
    let cache = USER_PROVIDER_CACHE.get(userId)

    // 如果缓存存在且未过期，直接返回
    if (cache && now - cache.updatedAt < CACHE_TTL) {
      return cache
    }

    // 从数据库获取用户配置
    const [dbUser] = await db
      .select({ providerSettings: userTable.providerSettings })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1)

    const userProviders =
      (dbUser?.providerSettings as ProviderConfig[]) || this.getAllProviders()

    // 创建缓存：先用默认配置作为基础，再用用户配置覆盖
    const userProviderConfigs = new Map<string, ProviderConfig>(
      this.providerConfigs
    )
    const userModelConfigs: Record<string, ModelConfig> = {
      ...this.modelConfigs,
    }

    for (const provider of userProviders) {
      userProviderConfigs.set(provider.id, provider)
      for (const model of provider.models || []) {
        userModelConfigs[model.id] = model
      }
    }

    cache = {
      providers: createProviders(userProviderConfigs),
      modelConfigs: userModelConfigs,
      updatedAt: now,
    }

    USER_PROVIDER_CACHE.set(userId, cache)
    console.log(`[ProviderService] Created provider cache for user: ${userId}`)

    return cache
  }

  private validateAndParseModel(modelIdentifier: string) {
    const { modelKey, providerId } = parseModelIdentifier(modelIdentifier)

    if (!providerId) {
      throw new Error(
        `No available provider for model: ${modelKey}. Please configure API keys in settings.`
      )
    }

    return { modelKey, providerId }
  }

  async getProviderModel(modelIdentifier: string, userId: string) {
    const { modelKey, providerId } = this.validateAndParseModel(modelIdentifier)
    const cache = await this.getOrCreateUserCache(userId)
    const provider = cache.providers.get(providerId)

    if (!provider) {
      throw new Error(
        `Provider ${providerId} not initialized for model: ${modelKey}`
      )
    }

    const providerModelName = resolveProviderModelName(
      cache.modelConfigs,
      modelKey,
      providerId
    )

    return provider(providerModelName)
  }

  async getModelPricing(
    modelIdentifier: string,
    userId: string
  ): Promise<{ input: string; output: string } | null> {
    const { modelKey } = parseModelIdentifier(modelIdentifier)
    const cache = await this.getOrCreateUserCache(userId)
    return cache.modelConfigs[modelKey]?.pricing ?? null
  }

  /**
   * 清除用户的 provider 缓存（当用户更新配置时调用）
   */
  clearUserCache(userId: string) {
    USER_PROVIDER_CACHE.delete(userId)
    console.log(`[ProviderService] Cleared provider cache for user: ${userId}`)
  }

  /**
   * 清除所有用户的 provider 缓存
   */
  clearAllCache() {
    USER_PROVIDER_CACHE.clear()
    console.log('[ProviderService] Cleared all provider caches')
  }

  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providerConfigs.values())
  }
}

export const providerService = new ProviderService()
