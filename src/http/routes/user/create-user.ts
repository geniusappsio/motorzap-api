import Elysia from 'elysia'
import z from 'zod'

export const createUserRoute = new Elysia({ prefix: '/api/v1' })
  .post('/users', async ({ body, set }) => {
    const user = body
    set.status = 201
    return { user }
  }, {
    body: z.object({
      role: z.optional(z.enum(['MANAGER', 'CUSTOMER', 'ADMIN']).default('CUSTOMER')),
      name: z.string(),
      phone: z.string().min(10).max(20)
    }),
    detail: {
      tags: ['User'],
      summary: 'Create a new user',
      description: 'Endpoint to create a new user in the system'
    }
  })
