import { openapi } from '@elysiajs/openapi'
import Elysia from 'elysia'
import z from 'zod'

export const openapiPlugin = new Elysia({ name: 'openapi' }).use(openapi({
  path: '/api/docs',
  specPath: '/api/docs/json',
  scalar: {
    url: '/api/docs/json'
  },
  mapJsonSchema: {
    zod: z.toJSONSchema
  },
  documentation: {
    info: {
      title: 'MotorZap API',
      description: 'MotorZap API Documentation',
      contact: {
        name: 'MotorZap',
        url: 'https://motorzap.io',
        email: 'support@motorzap.io'
      },
      version: '1.0.0'
    },
    tags: [
      { name: 'User', description: 'User related endpoints' }
    ]
  }
}))
