# Exemplo de Integração - Job de Sincronização WABA

## Como Integrar os Jobs no Servidor

### Opção 1: Integração no `src/presentation/http/server.ts` (Recomendado)

```typescript
import { Elysia } from 'elysia'
import { openapiPlugin } from '@/http/plugins/openapi'
import { createUserRoutes } from './routes'
import { env } from '@/env'
import { db } from '@/infrastructure/database'
import { DIContainer } from '@/infrastructure/di/container'
import { initializeJobs, stopJobs } from '@/infrastructure/jobs' // 👈 ADICIONAR

// Initialize DI container
const diContainer = DIContainer.initialize(db)

const app = new Elysia()
  .use(openapiPlugin)
  .use(createUserRoutes(diContainer))
  .get('/', () => 'Hello Elysia')

app.listen(env.PORT, (server) => {
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`)

  // 👇 INICIALIZAR JOBS APÓS SERVIDOR SUBIR
  initializeJobs()
})

// 👇 GRACEFUL SHUTDOWN
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...')
  stopJobs()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...')
  stopJobs()
  process.exit(0)
})

export default app
```

### Opção 2: Apenas no Worker Principal (Cluster Mode)

Se você estiver usando cluster mode (como no `src/index.ts`), você pode querer rodar os jobs apenas no worker principal para evitar duplicação:

```typescript
// src/index.ts
import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'
import { initializeJobs, stopJobs } from '@/infrastructure/jobs' // 👈 ADICIONAR

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)

  // 👇 INICIALIZAR JOBS APENAS NO PRIMARY
  initializeJobs()

  for (let i = 0; i < os.availableParallelism(); i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
  })

  // 👇 GRACEFUL SHUTDOWN
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down primary...')
    stopJobs()
    process.exit(0)
  })
} else {
  await import('./presentation/http/server')
  console.log(`Worker ${process.pid} started`)
}
```

## Teste Manual de Sincronização

### 1. Criar um endpoint para testar

Crie um endpoint de teste para sincronizar manualmente:

```typescript
// src/presentation/http/routes/whatsapp.routes.ts
import { Elysia } from 'elysia'
import { SyncBusinessManagerUseCase } from '@/domain/whatsapp/use-cases'

export const whatsappRoutes = new Elysia({ prefix: '/whatsapp' })
  .post('/sync/:businessManagerId', async ({ params }) => {
    const syncUseCase = new SyncBusinessManagerUseCase()

    const result = await syncUseCase.execute({
      businessManagerId: params.businessManagerId
    })

    return {
      success: result.success,
      data: result.result
    }
  })
```

### 2. Testar via API

```bash
# Criar Business Manager apenas com token
curl -X POST http://localhost:3000/business-managers \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_META_SYSTEM_USER_TOKEN"
  }'

# Resposta:
# { "id": "abc-123-456", ... }

# Sincronizar manualmente
curl -X POST http://localhost:3000/whatsapp/sync/abc-123-456

# Resposta:
# {
#   "success": true,
#   "data": {
#     "businessManagerId": "abc-123-456",
#     "metaBusinessId": "1234567890",
#     "wabasCount": 2,
#     "phoneNumbersCount": 3,
#     "errors": []
#   }
# }
```

## Monitoramento de Logs

Os jobs emitem logs detalhados. Configure seu logger para capturá-los:

```typescript
// Exemplo de logs que você verá:

[Jobs] 🚀 Initializing jobs...
[JobScheduler] ✅ Registered job: sync-waba (interval: 3600000ms, enabled: true)
[JobScheduler] 🚀 Starting job scheduler...
[JobScheduler] ▶️  Started job: sync-waba
[JobScheduler] 🔄 Running job: sync-waba
[SyncWABAJob] 🔄 Starting WABA sync job...
[SyncWABAJob] 📋 Found 2 Business Manager(s) to sync
[SyncWABAJob] 🔄 Syncing Business Manager: abc-123 (My Company)
[SyncBusinessManager] ✅ Sync completed successfully: { ... }
[JobScheduler] ✅ Job "sync-waba" completed in 1523ms
```

## Variáveis de Ambiente (Opcional)

Você pode adicionar controle via env vars:

```bash
# .env
WABA_SYNC_ENABLED=true
WABA_SYNC_INTERVAL_MS=3600000  # 1 hora
```

E ajustar o job:

```typescript
// src/infrastructure/jobs/sync-waba.job.ts
import { env } from '@/env'

export const syncWABAJob: Job = {
  name: 'sync-waba',
  enabled: env.WABA_SYNC_ENABLED ?? true,
  intervalMs: env.WABA_SYNC_INTERVAL_MS ?? 3600000,
  async run() { ... }
}
```

## Checklist de Integração

- [ ] Adicionar `initializeJobs()` no servidor
- [ ] Adicionar `stopJobs()` no graceful shutdown
- [ ] Gerar migration do Drizzle (`bun drizzle-kit generate`)
- [ ] Executar migration (`bun drizzle-kit migrate`)
- [ ] Testar criação de Business Manager com apenas token
- [ ] Testar sincronização manual via use case ou endpoint
- [ ] Verificar logs do job automático
- [ ] Validar dados sincronizados no banco de dados

## Próximos Passos Após Integração

1. **Criar endpoint de webhook** para receber notificações da Meta em tempo real
2. **Adicionar autenticação** nos endpoints de sincronização manual
3. **Implementar retry logic** para tokens expirados
4. **Configurar alertas** para falhas de sincronização
5. **Adicionar dashboard** para visualizar status de sincronização
