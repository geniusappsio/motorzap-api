# WhatsApp Meta Integration - Auto-Discovery

## Visão Geral

Esta implementação permite descobrir automaticamente **Business Managers**, **WABAs** e **Phone Numbers** usando apenas o `accessToken` via Meta Graph API.

## Funcionalidades

✅ **Descoberta Automática**: Apenas o `accessToken` é obrigatório no banco
✅ **Sincronização Completa**: Descobre toda a hierarquia (BM → WABA → Phone Numbers)
✅ **Job Automático**: Sincronização periódica a cada 1 hora
✅ **Insert/Update**: Cria novos registros ou atualiza existentes
✅ **Suporte a múltiplos WABAs**: Owned e Client WABAs

## Arquitetura

```
Business Manager (TB_BUSINESS_MANAGERS)
├── Access Token (NOT NULL) ✅ Único campo obrigatório
├── Meta Business ID (descoberto automaticamente)
├── Name (descoberto automaticamente)
└── Last Synced At (timestamp da última sincronização)

WhatsApp Business Accounts (TB_WHATSAPP_BUSINESS_ACCOUNTS)
├── Meta WABA ID (descoberto automaticamente)
├── Name, Currency, Timezone (descobertos automaticamente)
└── Ownership Type (OWNED, CLIENT, SHARED)

Phone Numbers (TB_WHATSAPP_PHONE_NUMBERS)
├── Meta Phone Number ID (descoberto automaticamente)
├── Phone Number, Display Name (descobertos automaticamente)
└── Quality Rating, Status, etc. (descobertos automaticamente)
```

## Como Usar

### 1. Criar Business Manager (apenas com token)

```typescript
import { db } from '@/infrastructure/database/drizzle/connection'
import { businessManager } from '@/infrastructure/database/drizzle/schema/business-managers'

// Inserir Business Manager apenas com o token
const [bm] = await db
  .insert(businessManager)
  .values({
    accessToken: 'YOUR_META_SYSTEM_USER_TOKEN',
    isActive: true
  })
  .returning()

console.log('Business Manager criado:', bm.id)
// metaBusinessId ainda é NULL neste ponto
```

### 2. Sincronizar Manualmente

```typescript
import { SyncBusinessManagerUseCase } from '@/domain/whatsapp/use-cases'

const syncUseCase = new SyncBusinessManagerUseCase()

const result = await syncUseCase.execute({
  businessManagerId: bm.id
})

if (result.success) {
  console.log('✅ Sincronização completa!')
  console.log('Business Manager ID:', result.result.metaBusinessId)
  console.log('WABAs encontradas:', result.result.wabasCount)
  console.log('Phone Numbers encontrados:', result.result.phoneNumbersCount)
} else {
  console.error('❌ Erros:', result.result.errors)
}
```

### 3. Job Automático (Recomendado)

O job já está configurado para rodar automaticamente a cada 1 hora.

**Inicializar jobs no seu servidor:**

```typescript
// src/index.ts ou src/server.ts
import { initializeJobs } from '@/infrastructure/jobs'

// Iniciar jobs ao subir o servidor
initializeJobs()

// Para parar os jobs (ex: no shutdown)
// import { stopJobs } from '@/infrastructure/jobs'
// stopJobs()
```

O job vai:
1. Buscar todos Business Managers com `accessToken` válido
2. Sincronizar cada um automaticamente
3. Atualizar WABAs e Phone Numbers
4. Registrar logs de sucesso/erro

## Configuração do Job

Para alterar a frequência do job, edite [src/infrastructure/jobs/sync-waba.job.ts](./../../infrastructure/jobs/sync-waba.job.ts):

```typescript
export const syncWABAJob: Job = {
  name: 'sync-waba',
  enabled: true,
  intervalMs: 3600000, // 1 hora (altere aqui)
  async run() { ... }
}
```

**Exemplos de intervalos:**
- 30 minutos: `1800000`
- 1 hora: `3600000` (padrão)
- 6 horas: `21600000`
- 24 horas: `86400000`

## Meta Graph API - Endpoints Utilizados

| Endpoint | Descrição |
|----------|-----------|
| `GET /me/businesses` | Descobre Business Manager ID |
| `GET /{business-id}/owned_whatsapp_business_accounts` | Lista WABAs próprias |
| `GET /{business-id}/client_whatsapp_business_accounts` | Lista WABAs compartilhadas |
| `GET /{waba-id}/phone_numbers` | Lista Phone Numbers de uma WABA |

## Permissões Necessárias

O `accessToken` deve ter as seguintes permissões:

- ✅ `whatsapp_business_management`
- ✅ `business_management`

**Como obter o token:**

1. Acesse [Meta Business Suite](https://business.facebook.com/)
2. Configure > System Users
3. Crie um System User
4. Gere um token com as permissões acima
5. Use esse token no campo `accessToken`

## Estrutura de Arquivos

```
src/domain/whatsapp/
├── services/
│   ├── meta-graph-api.service.ts    # Cliente HTTP para Meta Graph API
│   └── waba-sync.service.ts         # Lógica de sincronização
├── use-cases/
│   └── sync-business-manager.use-case.ts  # Orquestração
├── types/
│   └── meta-graph-api.types.ts      # Types da API
└── README.md

src/infrastructure/
├── jobs/
│   ├── scheduler.ts                 # Job scheduler genérico
│   ├── sync-waba.job.ts            # Job de sincronização
│   └── index.ts                    # Inicialização
└── database/drizzle/schema/
    └── business-managers.ts         # Schema atualizado
```

## Migrations

**IMPORTANTE**: Você precisa gerar e executar as migrations do Drizzle:

```bash
# Gerar migration
bun drizzle-kit generate

# Executar migration
bun drizzle-kit migrate
```

As alterações no schema:
- `metaBusinessId`: NOT NULL → NULLABLE
- `name`: NOT NULL → NULLABLE
- Novo campo: `lastSyncedAt`

## Exemplos de Logs

### Sucesso
```
[SyncWABAJob] 🔄 Starting WABA sync job...
[SyncWABAJob] 📋 Found 2 Business Manager(s) to sync
[SyncWABAJob] 🔄 Syncing Business Manager: abc-123 (My Company)
[SyncBusinessManager] ✅ Sync completed successfully: {
  businessManagerId: 'abc-123',
  metaBusinessId: '1234567890',
  wabasCount: 2,
  phoneNumbersCount: 3
}
[SyncWABAJob] ✅ Sync job completed: {
  total: 2,
  success: 2,
  failed: 0,
  totalWABAs: 4,
  totalPhoneNumbers: 6
}
```

### Erro
```
[SyncWABAJob] ❌ Failed syncs:
  - abc-456 (Another Company): [
    'Invalid access token'
  ]
```

## Troubleshooting

### Token Inválido
```
Error: Invalid OAuth 2.0 Access Token
```
**Solução**: Verifique se o token não expirou e tem as permissões corretas.

### Business Manager não encontrado
```
Error: No businesses found for this access token
```
**Solução**: Certifique-se de que o System User tem acesso ao Business Manager.

### Rate Limit
```
Error: (#4) Application request limit reached
```
**Solução**: Aumente o intervalo do job ou aguarde o rate limit resetar.

## Próximos Passos

- [ ] Implementar retry logic para falhas temporárias
- [ ] Adicionar cache de respostas da API
- [ ] Implementar webhook handler para sincronização em tempo real
- [ ] Adicionar métricas e monitoramento
- [ ] Implementar circuit breaker para a API
