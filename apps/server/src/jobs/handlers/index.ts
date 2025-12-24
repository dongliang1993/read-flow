import { registerHandler } from '../runner'
import { parseBookHandler } from './parse-book'
import { embedBookHandler } from './embed-book'
import { summarizeBookHandler } from './summarize-book'

/**
 * 注册所有 Job Handlers
 */
export function registerAllHandlers(): void {
  registerHandler(parseBookHandler)
  registerHandler(embedBookHandler)
  registerHandler(summarizeBookHandler)
}

export { parseBookHandler, embedBookHandler, summarizeBookHandler }

