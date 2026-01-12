import { db } from '../db'
import { userCredits, creditTransactions, user } from '../db/schema'
import { eq, desc, sql } from 'drizzle-orm'

const CREDITS_PER_DOLLAR = 1000

interface ModelPricing {
  input: string
  output: string
}

interface CreditCostCalculation {
  inputCost: number
  outputCost: number
  totalCost: number
  credits: number
}

class CreditService {
  /**
   * 获取用户积分
   */
  async getUserCredits(userId: string) {
    const result = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1)

    return result[0] || null
  }

  /**
   * 获取或初始化用户积分（懒加载）
   */
  async getOrCreateUserCredits(userId: string, initialCredits: number = 1000) {
    let credits = await this.getUserCredits(userId)

    if (!credits) {
      await this.initializeUserCredits(userId, initialCredits)
      credits = await this.getUserCredits(userId)
    }

    return credits
  }

  /**
   * 初始化用户积分（新用户注册时调用）
   */
  async initializeUserCredits(userId: string, initialCredits: number = 1000) {
    try {
      await db.insert(userCredits).values({
        userId,
        credits: initialCredits.toFixed(2),
        totalEarned: initialCredits.toFixed(2),
        totalSpent: '0.00',
      })

      await db.insert(creditTransactions).values({
        userId,
        amount: initialCredits.toFixed(2),
        type: 'initial',
        metadata: { reason: 'Initial credits for new user' },
      })

      return true
    } catch (error) {
      console.error('[CreditService] Failed to initialize credits:', error)
      return false
    }
  }

  /**
   * 计算费用
   */
  calculateCost(
    inputTokens: number,
    outputTokens: number,
    pricing: ModelPricing
  ): CreditCostCalculation {
    const inputPrice = parseFloat(pricing.input)
    const outputPrice = parseFloat(pricing.output)

    // 价格是 per 1K tokens
    const inputCostUSD = (inputTokens / 1000) * inputPrice
    const outputCostUSD = (outputTokens / 1000) * outputPrice
    const totalCostUSD = inputCostUSD + outputCostUSD

    // 转换为积分
    const credits = Math.ceil(totalCostUSD * CREDITS_PER_DOLLAR * 100) / 100

    return {
      inputCost: inputCostUSD,
      outputCost: outputCostUSD,
      totalCost: totalCostUSD,
      credits,
    }
  }

  /**
   * 检查积分是否充足
   */
  async hasEnoughCredits(
    userId: string,
    requiredCredits: number
  ): Promise<boolean> {
    const userCredit = await this.getUserCredits(userId)
    if (!userCredit) return false

    return parseFloat(userCredit.credits) >= requiredCredits
  }

  /**
   * 扣除积分（事务）
   */
  async deductCredits(
    userId: string,
    credits: number,
    metadata: {
      modelId: string
      inputTokens: number
      outputTokens: number
      [key: string]: any
    }
  ): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        // 1. 扣除积分
        await tx
          .update(userCredits)
          .set({
            credits: sql`CAST(credits AS DECIMAL) - ${credits}`,
            totalSpent: sql`CAST(total_spent AS DECIMAL) + ${credits}`,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId))

        // 2. 记录交易
        await tx.insert(creditTransactions).values({
          userId,
          amount: (-credits).toFixed(2),
          type: 'usage',
          modelId: metadata.modelId,
          inputTokens: metadata.inputTokens,
          outputTokens: metadata.outputTokens,
          metadata,
        })
      })

      return true
    } catch (error) {
      console.error('[CreditService] Failed to deduct credits:', error)
      return false
    }
  }

  /**
   * 增加积分
   */
  async addCredits(
    userId: string,
    credits: number,
    type: string = 'purchase',
    metadata?: any
  ): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(userCredits)
          .set({
            credits: sql`CAST(credits AS DECIMAL) + ${credits}`,
            totalEarned: sql`CAST(total_earned AS DECIMAL) + ${credits}`,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId))

        await tx.insert(creditTransactions).values({
          userId,
          amount: credits.toFixed(2),
          type,
          metadata,
        })
      })

      return true
    } catch (error) {
      console.error('[CreditService] Failed to add credits:', error)
      return false
    }
  }

  /**
   * 获取交易历史
   */
  async getTransactions(userId: string, limit: number = 50) {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit)
  }
}

export const creditService = new CreditService()

