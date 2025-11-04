import Elysia from 'elysia';
import type { DIContainer } from '../../../infrastructure/di/container';
import { createUserSchema } from '../../../infrastructure/http/validators/user.validator';

export function createUserRoutes(container: DIContainer) {
  const userController = container.getUserController();

  return new Elysia({ prefix: '/api/v1' })
    .post('/users',
      async ({ body, set }) => {
        try {
          const result = await userController.create(body);
          set.status = 201;
          return { user: result };
        } catch (error: any) {
          set.status = error.statusCode || 400;
          return {
            error: {
              code: error.code || 'INTERNAL_ERROR',
              message: error.message || 'An unexpected error occurred',
            },
          };
        }
      },
      {
        body: createUserSchema,
        detail: {
          tags: ['User'],
          summary: 'Create a new user',
          description: 'Endpoint to create a new user in the system',
        },
      }
    );
}
