import { z } from 'zod'
import { createTool } from './create-tool'

const stepSchema = z.object({
  id: z.string().describe('步骤的唯一标识'),
  description: z.string().describe('步骤的具体描述'),
  tool: z.string().optional().describe('要使用的工具名称，如 webSearch'),
})

export const planTool = createTool({
  name: 'plan',
  description: `制定多步骤执行计划。仅在以下情况使用此工具：
- 任务需要多个步骤才能完成
- 需要协调使用多个工具
- 需要按特定顺序执行操作

对于简单问题，直接回答即可，不需要使用此工具。
创建计划后，请按顺序执行每个步骤。`,
  inputSchema: z.object({
    goal: z.string().describe('最终目标'),
    steps: z.array(stepSchema).describe('执行步骤列表'),
  }),
  canConcurrent: false,
  execute: async ({ goal, steps }) => {
    return {
      planId: crypto.randomUUID(),
      goal,
      steps: steps.map((s, i) => ({
        ...s,
        id: s.id || `step-${i + 1}`,
        status: 'pending' as const,
      })),
      createdAt: new Date().toISOString(),
    }
  },
})

