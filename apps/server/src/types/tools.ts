import type { z } from 'zod'

export interface Tool {
  name: string
  description: string
  inputSchema: z.ZodSchema
  execute: (params: any) => Promise<any>
  canConcurrent: boolean
}
