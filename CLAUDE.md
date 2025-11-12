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

# Testing
bun test              # Run all tests
bun run test:unit     # Run unit tests only
bun run test:integration  # Run integration tests only
bun run test:watch    # Watch mode

# Quality
bun run lint
```

## Architecture (Layered Simple)

This is a **Layered Simple** backend API that favors pragmatism over complex patterns:

```plaintext
src/
├── models/           # Domain entities + value objects (business logic)
│   ├── user/         # User entity, phone/role VOs, errors
│   └── whatsapp/     # 5 WhatsApp entities, enums, errors
│
├── services/         # Use cases + business logic
│   ├── user/
│   │   └── user.service.ts       # All user operations (CRUD)
│   └── whatsapp/
│       ├── meta-graph-api.service.ts  # Meta API client
│       └── waba-sync.service.ts       # Sync logic
│
├── routes/           # HTTP controllers (thin layer)
│   ├── user.routes.ts
│   └── index.ts
│
├── database/         # Drizzle ORM (schemas, migrations, seed)
│   ├── connection.ts
│   ├── schema/
│   │   ├── users.ts
│   │   ├── whatsapp/  # Multiple WhatsApp tables
│   │   └── vehicles/  # Vehicle tables (future)
│   └── seed.ts
│
├── jobs/             # Background jobs
│   ├── scheduler.ts
│   └── sync-waba.job.ts
│
├── shared/           # Shared code (Result pattern, base classes)
│   ├── result.ts     # Result<T> for error handling
│   ├── base-entity.ts
│   └── domain-error.ts
│
├── env/              # Environment variables validation
└── index.ts          # Cluster mode entry point
```

### Key Patterns

1. **Result Pattern** for error handling (`Result<T>` type in `shared/`)
2. **Value Objects** for domain primitives with validation (Phone, Role, etc.)
3. **Services consolidate use cases** - no separate use case classes
4. **Entities for complex business logic** - optional, not mandatory
5. **Enums over Value Object classes** for simple types

## How to Add a New Feature

### Example: Adding "Products" Feature

1. **Create Entity** (if it has business logic):
```typescript
// src/models/product/product.entity.ts
import { BaseEntity, ok, fail, Result } from '@/shared'

export class Product extends BaseEntity<ProductProps> {
  static create(data: {...}): Result<Product> {
    // Validation logic here
    return ok(new Product(...))
  }

  // Business methods
  updatePrice(newPrice: number): Result<void> { ... }
}
```

2. **Create Service** (consolidates all operations):
```typescript
// src/services/product/product.service.ts
import { db } from '@/database'
import { products } from '@/database/schema/products'

export class ProductService {
  constructor(private readonly db = db) {}

  async create(dto: CreateProductDTO): Promise<Result<ProductResponse>> {
    // 1. Validate with entity (if exists)
    // 2. Check business rules
    // 3. Save to database
    // 4. Return result
  }

  async list(): Promise<Result<ProductResponse[]>> { ... }
  async getById(id: string): Promise<Result<ProductResponse>> { ... }
  async update(id: string, dto: UpdateProductDTO): Promise<Result<ProductResponse>> { ... }
  async delete(id: string): Promise<Result<void>> { ... }
}
```

3. **Create Routes**:
```typescript
// src/routes/product.routes.ts
import { Elysia } from 'elysia'
import { ProductService } from '@/services/product/product.service'

const productService = new ProductService()

export const productRoutes = new Elysia({ prefix: '/api/v1/products' })
  .post('/', async ({ body, set }) => {
    const result = await productService.create(body)
    if (result.isFailure) {
      set.status = result.error.statusCode
      return { error: { code: result.error.code, message: result.error.message } }
    }
    return { product: result.value }
  })
  // ... other endpoints
```

4. **Create Database Schema**:
```typescript
// src/database/schema/products.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const products = pgTable('tb_products', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  name: varchar({ length: 255 }).notNull(),
  price: varchar({ length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
```

5. **Register Routes**:
```typescript
// src/routes/index.ts
import { productRoutes } from './product.routes'

export const routes = new Elysia()
  .use(userRoutes)
  .use(productRoutes)  // Add this
```

### When to Use Entities vs Plain Objects

**Use Entities when:**
- Complex validation logic
- Multiple business methods
- State changes need validation
- Rich domain model

**Use Plain Objects when:**
- Simple CRUD operations
- Minimal validation (can be done in service)
- Data transfer only

## Testing

The project uses **Bun's built-in test runner**:

```plaintext
__tests__/
├── unit/              # Fast tests with mocks
│   ├── models/        # Test entities, value objects
│   ├── services/      # Test business logic
│   └── routes/        # Test HTTP handlers
│
├── integration/       # Tests with real database
│   └── whatsapp-sync.integration.test.ts
│
├── e2e/               # End-to-end tests (future)
│
└── helpers/           # Test utilities
    ├── test-database.ts   # Setup/cleanup
    ├── fixtures.ts        # Fake data generators
    └── mocks.ts           # Mock factories
```

### Writing Tests

**Unit Test Example:**
```typescript
// __tests__/unit/services/product.service.test.ts
import { beforeEach, describe, expect, test } from 'bun:test'
import { ProductService } from '@/services/product/product.service'
import { createMockDatabase } from '../../helpers/mocks'

describe('ProductService', () => {
  let productService: ProductService
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockDatabase()
    productService = new ProductService(mockDb)  // Inject mock
  })

  test('should create product successfully', async () => {
    const result = await productService.create({ name: 'Test', price: 100 })
    expect(result.isSuccess).toBe(true)
    expect(mockDb.insert).toHaveBeenCalled()
  })
})
```

**Integration Test Example:**
```typescript
// __tests__/integration/product.integration.test.ts
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { db } from '@/database'
import { ProductService } from '@/services/product/product.service'
import { cleanDatabase } from '../helpers/test-database'

describe('Product Integration Tests', () => {
  let productService: ProductService

  beforeAll(() => {
    productService = new ProductService(db)  // Real database
  })

  afterAll(async () => {
    await cleanDatabase()
  })

  test('should create and retrieve product from database', async () => {
    const createResult = await productService.create({ name: 'Test', price: 100 })
    expect(createResult.isSuccess).toBe(true)

    const getResult = await productService.getById(createResult.value.id)
    expect(getResult.isSuccess).toBe(true)
    expect(getResult.value.name).toBe('Test')
  })
})
```

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

- **Meta Graph API Client**: `src/services/whatsapp/meta-graph-api.service.ts`
- **Sync Service**: `src/services/whatsapp/waba-sync.service.ts`
- **Auto-Sync Job**: `src/jobs/sync-waba.job.ts` (runs every 1 hour)

### Database Hierarchy

```plaintext
tb_business_managers (only accessToken required)
  └── tb_whatsapp_business_accounts
      └── tb_whatsapp_phone_numbers
```

## Database (Drizzle ORM + PostgreSQL)

- **ORM**: Drizzle ORM (type-safe, SQL-like)
- **Database**: PostgreSQL
- **Schema Location**: `src/database/schema/`
- **Migrations**: Generated with `bun run generate`, applied with `bun run migrate`

### Important Notes

- Use `Bun.sql` for Postgres connections (not `pg` or `postgres.js`)
- All schemas use UUID v7 for primary keys: `Bun.randomUUIDv7()`
- Database exports are at `@/database`
- Path alias `@/*` maps to `src/*`

## Background Jobs & Scheduler

The application includes a **custom job scheduler** for periodic background tasks:

### Job Scheduler Architecture

- **Scheduler**: `src/jobs/scheduler.ts` (singleton, generic)
- **Jobs**: `src/jobs/*.job.ts`
- **Initialization**: Jobs run **only in cluster primary process** (see `src/index.ts`)

### Adding New Jobs

```typescript
// 1. Create job file: src/jobs/my-job.job.ts
import type { Job } from './scheduler'

export const myJob: Job = {
  name: 'my-job',
  enabled: true,
  intervalMs: 3600000, // 1 hour
  async run() {
    // Job logic here
  }
}

// 2. Register in src/jobs/index.ts
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

### Important

- Jobs run **only in primary** to avoid duplication
- Workers are forked automatically based on `os.availableParallelism()`

## HTTP Framework

Uses **Elysia.js** (Bun-native, not Express):

```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
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
- ✅ Services consolidate use cases (no separate use case classes)
- ✅ Entities only for complex business logic
- ✅ Enums for simple types (not value object classes)
- ❌ Don't use Express (use Elysia)
- ❌ Don't use `better-sqlite3` (use `bun:sqlite`)
- ❌ Don't use `pg` or `postgres.js` (use `Bun.sql`)
- ❌ Don't use `ws` (WebSocket is built-in)
- ❌ Don't use `dotenv` (Bun auto-loads `.env`)
- ❌ Don't create factories unless truly needed
- ❌ Don't create repository abstractions for simple CRUD
