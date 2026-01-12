import { env } from '../../config/env'

export interface UserCredits {
  credits: number
  totalEarned: number
  totalSpent: number
}

export interface CreditTransaction {
  id: number
  amount: number
  type: string
  modelId?: string
  inputTokens?: number
  outputTokens?: number
  metadata?: any
  createdAt: string
}

export const creditsService = {
  async getCredits(): Promise<UserCredits> {
    const response = await fetch(`${env.apiBaseUrl}/api/v1/credits`, {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch credits')
    }
    return response.json()
  },

  async getTransactions(limit = 50): Promise<CreditTransaction[]> {
    const response = await fetch(
      `${env.apiBaseUrl}/api/v1/credits/transactions?limit=${limit}`,
      {
        credentials: 'include',
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }
    const data = await response.json()
    return data.transactions
  },
}
