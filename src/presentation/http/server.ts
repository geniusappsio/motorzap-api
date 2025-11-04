import { Elysia } from 'elysia';
import { openapiPlugin } from '@/http/plugins/openapi';
import { createUserRoutes } from './routes';
import { env } from '@/env';
import { db } from '@/infrastructure/database';
import { DIContainer } from '@/infrastructure/di/container';

// Initialize DI container
const diContainer = DIContainer.initialize(db);

const app = new Elysia()
  .use(openapiPlugin)
  .use(createUserRoutes(diContainer))
  .get('/', () => 'Hello Elysia');

app.listen(env.PORT, (server) => {
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});

export default app;
