import { Elysia } from 'elysia'

import { userRoutes } from './user.routes'

export const routes = new Elysia()
  .use(userRoutes)
