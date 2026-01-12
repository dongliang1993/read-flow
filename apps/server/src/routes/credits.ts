import { Hono } from 'hono'
import { creditService } from '../services/credit-service'
import type { auth } from '../lib/auth'

type Variables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const credits = new Hono<{ Variables: Variables }>()

credits.get('/', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userCredits = await creditService.getOrCreateUserCredits(user.id)

    if (!userCredits) {
      return c.json({
        credits: 0,
        totalEarned: 0,
        totalSpent: 0,
      })
    }

    return c.json({
      credits: parseFloat(userCredits.credits),
      totalEarned: parseFloat(userCredits.totalEarned),
      totalSpent: parseFloat(userCredits.totalSpent),
    })
  } catch (error) {
    console.error('Get credits error:', error)
    return c.json({ error: 'Failed to fetch credits' }, 500)
  }
})

credits.get('/transactions', async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const limit = parseInt(c.req.query('limit') || '50')

    const transactions = await creditService.getTransactions(user.id, limit)

    return c.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        type: tx.type,
        modelId: tx.modelId,
        inputTokens: tx.inputTokens,
        outputTokens: tx.outputTokens,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return c.json({ error: 'Failed to fetch transactions' }, 500)
  }
})

export default credits
