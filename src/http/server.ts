import { Elysia } from 'elysia'

import { env } from '@/env'
import { openapiPlugin } from '@/http/plugins/openapi'
import { createUserRoute } from '@/http/routes/user'

const app = new Elysia()
  .use(openapiPlugin)
  .use(createUserRoute)
  .get('/', () => 'Hello Elysia')

app.listen(env.PORT, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
})
