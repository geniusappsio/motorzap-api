# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime & Package Manager

This project uses **Bun** as the JavaScript runtime and package manager (not Node.js or npm).

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`
- Use `bun run <script>` instead of `npm run <script>`
- Bun automatically loads `.env` files - do not use `dotenv`

## Development Commands

```bash
# Install dependencies
bun install

# Development (with hot reload)
bun run dev

# Production server (cluster mode)
bun run src/index.ts

# Build for production
bun run build
bun run build:binario  # Compile to single binary

# Database
bun run generate  # Generate Drizzle migrations
bun run migrate   # Run migrations
bun run seed      # Seed database
bun run studio    # Open Drizzle Studio

# Testing & Quality
bun test
bun run lint
```

## Architecture

This is a **Domain-Driven Design (DDD)** backend API with SOLID principles, following a layered architecture:

```plaintext
src/
├── domain/           # Business logic & entities (framework-agnostic)
│   ├── user/
│   ├── whatsapp/    # WhatsApp Business domain
│   └── shared/      # Shared domain utilities (Result, BaseEntity, etc.)
├── application/     # Use cases & application services
│   ├── use-cases/
│   └── factories/
├── infrastructure/  # External concerns (DB, HTTP, jobs)
│   ├── database/
│   │   └── drizzle/ # Drizzle ORM schemas & migrations
│   ├── jobs/        # Background job scheduler
│   ├── http/
│   └── di/          # Dependency injection container
└── presentation/    # HTTP controllers & routes
    └── http/
```

### Key Architectural Patterns

1. **Domain Layer** is pure TypeScript with no external dependencies
2. **Result Pattern** for error handling (`Result<T>` type in `domain/shared`)
3. **Value Objects** for domain primitives (Phone, Role, etc.)
4. **Factories** for complex entity creation
5. **Repository Pattern** with interfaces in domain, implementations in infrastructure

## WhatsApp Business Integration

The system integrates with **Meta WhatsApp Business API** for automated discovery and sync:

### Auto-Discovery Flow

1. Store only `accessToken` in `tb_business_managers` (only required field)
2. Background job automatically discovers:
   - Business Manager ID (`metaBusinessId`)
   - WhatsApp Business Accounts (WABAs)
   - Phone Numbers
   - Business Profiles

### Key Components

- **Meta Graph API Client**: `src/domain/whatsapp/services/meta-graph-api.service.ts`
- **Sync Service**: `src/domain/whatsapp/services/waba-sync.service.ts`
- **Sync Use Case**: `src/domain/whatsapp/use-cases/sync-business-manager.use-case.ts`
- **Auto-Sync Job**: `src/infrastructure/jobs/sync-waba.job.ts` (runs every 1 hour)

### Database Hierarchy

```plaintext
tb_business_managers (only accessToken required)
  └── tb_whatsapp_business_accounts
      └── tb_whatsapp_phone_numbers
```

## Database (Drizzle ORM + PostgreSQL)

- **ORM**: Drizzle ORM (type-safe, SQL-like)
- **Database**: PostgreSQL
- **Schema Location**: `src/infrastructure/database/drizzle/schema/`
- **Migrations**: Generated with `bun run generate`, applied with `bun run migrate`

### Important Notes

- Use `Bun.sql` for Postgres connections (not `pg` or `postgres.js`)
- All schemas use UUID v7 for primary keys: `Bun.randomUUIDv7()`
- Database exports are at `@/infrastructure/database`
- Path alias `@/*` maps to `src/*`

## Background Jobs & Scheduler

The application includes a **custom job scheduler** for periodic background tasks:

### Job Scheduler Architecture

- **Scheduler**: `src/infrastructure/jobs/scheduler.ts` (singleton, generic)
- **Jobs**: `src/infrastructure/jobs/*.job.ts`
- **Initialization**: Jobs run **only in cluster primary process** (see `src/index.ts`)

### Adding New Jobs

```typescript
// 1. Create job file: src/infrastructure/jobs/my-job.job.ts
import type { Job } from './scheduler'

export const myJob: Job = {
  name: 'my-job',
  enabled: true,
  intervalMs: 3600000, // 1 hour
  async run() {
    // Job logic here
  }
}

// 2. Register in src/infrastructure/jobs/index.ts
import { myJob } from './my-job.job'

export function initializeJobs() {
  jobScheduler.register(myJob)
  // ...
}
```

### Current Jobs

- **sync-waba**: Auto-syncs WhatsApp Business Managers (every 1 hour)

## Cluster Mode

The server runs in **cluster mode** for production performance:

- **Primary process**: Manages workers + runs background jobs
- **Worker processes**: Handle HTTP requests (one per CPU core)
- **Auto-restart**: Workers automatically restart if they crash

**Entry point**: `src/index.ts` (cluster orchestration)
**HTTP server**: `src/presentation/http/server.ts` (Elysia.js)

### Important

- Jobs run **only in primary** to avoid duplication
- Workers are forked automatically based on `os.availableParallelism()`

## HTTP Framework

Uses **Elysia.js** (Bun-native, not Express):

```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
  .use(openapiPlugin)
  .use(routes)
  .listen(env.PORT)
```

## Logging

All logs use **chalk** for colored output:

- 🟣 **Magenta**: Primary processes, initialization
- 🔵 **Blue**: Info, actions in progress
- 🟢 **Green**: Success
- 🟡 **Yellow**: Warnings
- 🔴 **Red**: Errors
- 🔷 **Cyan**: Technical details (IDs, counters)
- ⚫ **Gray**: Secondary information

```typescript
import chalk from 'chalk'

console.log(chalk.green.bold('✅ Success!'))
console.log(chalk.cyan(`ID: ${id}`))
```

## ESLint Configuration

The project uses a **custom ESLint config** with Bun-specific globals:

### Important Globals

ESLint is configured to recognize Bun runtime globals (no import needed):

- **Web APIs**: `fetch`, `URLSearchParams`, `FormData`, `Headers`, `Request`, `Response`
- **Timers**: `Timer`, `setInterval`, `setTimeout`, `clearInterval`, `clearTimeout`
- **Bun APIs**: `Bun`, `Buffer`, `process`, `console`

### Linting Rules

- **Standard JS** style with TypeScript adaptations
- **Simple Import Sort**: Auto-sorts imports
- **Drizzle Plugin**: Enforces `where` clauses on `delete`/`update`
- **Unused vars**: Must start with `_` if intentionally unused

## Testing

Uses **Bun's built-in test runner** (not Jest or Vitest):

```typescript
import { test, expect } from 'bun:test'

test('example test', () => {
  expect(1 + 1).toBe(2)
})
```

Run tests: `bun test`

## Environment Variables

- Loaded automatically by Bun from `.env` file
- Validated with Zod in `src/env.ts` (if present)
- Never commit `.env` to version control

## Code Style

- **Spacing**: 2 spaces for indentation
- **Semicolons**: Never use semicolons
- **Quotes**: Single quotes (except to avoid escaping)
- **Function spacing**: `function name ()` (space before parentheses)
- **Trailing commas**: Never
- **Arrow functions**: Spaces around arrows `() => {}`

## API Preferences

When working with this codebase:

- ✅ Use Bun native APIs (`Bun.file`, `Bun.sql`, `Bun.serve`)
- ❌ Don't use Express (use Elysia)
- ❌ Don't use `better-sqlite3` (use `bun:sqlite`)
- ❌ Don't use `pg` or `postgres.js` (use `Bun.sql`)
- ❌ Don't use `ws` (WebSocket is built-in)
- ❌ Don't use `dotenv` (Bun auto-loads `.env`)
