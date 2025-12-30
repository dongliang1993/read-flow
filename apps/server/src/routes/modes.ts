import { Hono } from 'hono'
import { modelsService } from '../services/model-service'
const modes = new Hono()

modes.get('/configs', async (c) => {
  try {
    const configs = modelsService.getConfigs()
    return c.json(configs)
  } catch (error) {
    console.error('Failed to load models config:', error)
    return c.json(
      {
        error: 'Failed to load models config',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default modes
