import type { Tool } from '../../../types/tools'
import { webSearchTool } from './web-search'

export const TOOL_DEFINITIONS = {
  webSearch: {
    tool: webSearchTool,
    label: 'Web Search',
    metadata: {
      canConcurrent: true,
      fileOperation: false,
      renderDoingUI: true,
    },
  },
}

let toolsCache: Record<string, Tool> | null = null

export function loadAllTools() {
  if (toolsCache) {
    return toolsCache
  }

  const tools: Record<string, Tool> = {}

  for (const [name, definition] of Object.entries(TOOL_DEFINITIONS)) {
    tools[name] = definition.tool
  }

  toolsCache = tools

  return tools
}

export function getAllToolsSync() {
  if (!toolsCache) {
    throw new Error(
      'Tools not loaded yet. Call await loadAllTools() first or ensure tools are preloaded at app startup.'
    )
  }
  return toolsCache
}

export type ToolName = keyof typeof TOOL_DEFINITIONS
