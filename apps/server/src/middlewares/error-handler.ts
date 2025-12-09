// Global error handler middleware

import type { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
  console.error('Unhandled error:', err)

  // Check if it's a known error type
  if (err.name === 'ZodError') {
    return c.json(
      {
        error: 'Validation error',
        details: err.message,
      },
      400
    )
  }

  // Default error response
  return c.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  )
}
