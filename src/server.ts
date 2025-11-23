import { Elysia } from 'elysia'

import { openapiPlugin } from '@/routes/plugins/openapi'

import { env } from './env'
import { routes } from './routes'

const app = new Elysia()
  .use(openapiPlugin)
  .use(routes)
  .get('/', () => 'MotorZap API is running! 🚀')

app.listen(env.PORT || 3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
