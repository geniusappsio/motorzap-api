import { Elysia, t } from 'elysia'

import { db } from '@/database/connection'
import { UserService } from '@/services/user/user.service'

const userService = new UserService(db)

export const userRoutes = new Elysia({ prefix: '/api/v1/users' })
  // Create user
  .post('/', async ({ body, set }) => {
    const result = await userService.create(body)

    if (result.isFailure) {
      const error = result.error
      set.status = error.statusCode || 400
      return {
        error: {
          code: error.code,
          message: error.message
        }
      }
    }

    set.status = 201
    return { user: result.value }
  }, {
    body: t.Object({
      phone: t.String({ minLength: 10, maxLength: 20, description: 'User phone number (Brazilian format)' }),
      role: t.Union([t.Literal('MANAGER'), t.Literal('CUSTOMER'), t.Literal('ADMIN')], { default: 'CUSTOMER', description: 'User role' }),
      name: t.String({ minLength: 1, maxLength: 255, description: 'User full name' }),
      email: t.Optional(t.String({ format: 'email', description: 'User email address' }))
    }),
    detail: {
      tags: ['User'],
      summary: 'Create a new user',
      description: 'Endpoint to create a new user in the system'
    }
  })

  // Get user by ID
  .get('/:id', async ({ params, set }) => {
    const result = await userService.getById(params.id)

    if (result.isFailure) {
      const error = result.error
      set.status = error.statusCode || 404
      return {
        error: {
          code: error.code,
          message: error.message
        }
      }
    }

    return { user: result.value }
  }, {
    params: t.Object({
      id: t.String({ format: 'uuid', description: 'User ID' })
    }),
    detail: {
      tags: ['User'],
      summary: 'Get user by ID',
      description: 'Endpoint to retrieve a user by their ID'
    }
  })

  // List all users
  .get('/', async ({ set }) => {
    const result = await userService.listAll()

    if (result.isFailure) {
      const error = result.error
      set.status = error.statusCode || 500
      return {
        error: {
          code: error.code,
          message: error.message
        }
      }
    }

    return { users: result.value }
  }, {
    detail: {
      tags: ['User'],
      summary: 'List all users',
      description: 'Endpoint to list all users in the system'
    }
  })

  // Update user
  .patch('/:id', async ({ params, body, set }) => {
    const result = await userService.update(params.id, body)

    if (result.isFailure) {
      const error = result.error
      set.status = error.statusCode || 400
      return {
        error: {
          code: error.code,
          message: error.message
        }
      }
    }

    return { user: result.value }
  }, {
    params: t.Object({
      id: t.String({ format: 'uuid', description: 'User ID' })
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1, maxLength: 255, description: 'User full name' })),
      email: t.Optional(t.String({ format: 'email', description: 'User email address' })),
      role: t.Optional(t.Union([t.Literal('MANAGER'), t.Literal('CUSTOMER'), t.Literal('ADMIN')], { description: 'User role' }))
    }),
    detail: {
      tags: ['User'],
      summary: 'Update user',
      description: 'Endpoint to update a user'
    }
  })

  // Delete user
  .delete('/:id', async ({ params, set }) => {
    const result = await userService.delete(params.id)

    if (result.isFailure) {
      const error = result.error
      set.status = error.statusCode || 404
      return {
        error: {
          code: error.code,
          message: error.message
        }
      }
    }

    set.status = 204
    return
  }, {
    params: t.Object({
      id: t.String({ format: 'uuid', description: 'User ID' })
    }),
    detail: {
      tags: ['User'],
      summary: 'Delete user',
      description: 'Endpoint to delete a user'
    }
  })
