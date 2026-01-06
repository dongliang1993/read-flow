import { z } from 'zod'
import { createTool } from './create-tool'

const stepSchema = z.object({
  id: z.string().describe('步骤的唯一标识'),
  description: z.string().describe('步骤的具体描述'),
  tool: z.string().optional().describe('要使用的工具名称，如 webSearch'),
})

export const createPlanTool = createTool({
  name: 'createPlan',
  description: `制定多步骤执行计划。仅在以下情况使用此工具：
- 任务需要多个步骤才能完成
- 需要协调使用多个工具
- 需要按特定顺序执行操作

对于简单问题，直接回答即可，不需要使用此工具。
创建计划后，请按顺序执行每个步骤，并使用 updatePlanStep 更新每个步骤的状态。`,
  inputSchema: z.object({
    title: z.string().describe('任务标题'),
    description: z.string().describe('任务描述'),
    steps: z.array(stepSchema).describe('执行步骤列表'),
  }),
  canConcurrent: false,
  execute: async ({ title, description, steps }) => {
    return {
      planId: crypto.randomUUID(),
      title,
      description,
      steps: steps.map(
        (
          s: { id?: string; description: string; tool?: string },
          i: number
        ) => ({
          ...s,
          id: s.id || `step-${i + 1}`,
          status: 'pending' as const,
        })
      ),
      createdAt: new Date().toISOString(),
    }
  },
})

export const updatePlanStepTool = createTool({
  name: 'updatePlanStep',
  description: `更新计划中某个步骤的状态。在执行计划时必须使用此工具：
- 开始执行步骤前，设置 status 为 "running"
- 完成步骤后，设置 status 为 "completed" 并提供执行结果
- 步骤失败时，设置 status 为 "error" 并提供错误信息`,
  inputSchema: z.object({
    stepId: z.string().describe('步骤 ID'),
    status: z.enum(['running', 'completed', 'error']).describe('步骤状态'),
    result: z.string().optional().describe('步骤执行结果或错误信息'),
  }),
  canConcurrent: false,
  execute: async ({ stepId, status, result }) => {
    return {
      stepId,
      status,
      result,
      updatedAt: new Date().toISOString(),
    }
  },
})
