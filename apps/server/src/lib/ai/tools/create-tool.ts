import type { z } from 'zod'

interface CreateToolOptions {
  name: string
  description: string
  inputSchema: z.ZodSchema
  execute: (params: any) => Promise<any>
  canConcurrent: boolean
  hidden?: boolean
  isBeta?: boolean
  badgeLabel?: string
}

export const createTool = (options: CreateToolOptions) => {
  const { name, description, inputSchema, execute, canConcurrent } = options

  const tool = {
    name,
    description,
    inputSchema: inputSchema as any,
    execute: execute,
    canConcurrent,
  }

  return tool
}
