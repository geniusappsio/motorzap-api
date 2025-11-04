# MotorZap API - Arquitetura DDD/SOLID

## Visão Geral

Este projeto segue os princípios de **Domain-Driven Design (DDD)** e **SOLID** para garantir uma arquitetura limpa, escalável e manutenível.

## Estrutura de Pastas

```
src/
├── domain/                      # Camada de Domínio (Lógica de Negócio Pura)
│   ├── shared/
│   │   ├── base-entity.ts      # Classe base para entidades
│   │   ├── result.ts           # Result pattern (Success/Failure)
│   │   └── domain-error.ts     # Exceções de domínio
│   │
│   ├── user/                   # Bounded Context: Usuários
│   │   ├── entities/           # Entidades com lógica de negócio
│   │   │   └── user.entity.ts
│   │   ├── value-objects/      # Objetos imutáveis de domínio
│   │   │   ├── phone.vo.ts
│   │   │   └── user-role.vo.ts
│   │   ├── repositories/       # Interfaces (contratos)
│   │   │   └── user-repository.interface.ts
│   │   └── errors/             # Exceções específicas do domínio
│   │       └── user-errors.ts
│   │
│   └── vehicle/                # Bounded Context: Veículos (Estrutura preparada)
│
├── application/                # Camada de Aplicação (Orquestração)
│   ├── use-cases/
│   │   ├── user/
│   │   │   ├── create-user/
│   │   │   │   ├── create-user.use-case.ts
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── create-user.response.ts
│   │   │   ├── get-user/
│   │   │   └── update-user/
│   │   └── vehicle/
│   │
│   └── factories/               # Factories para Criação de Entidades
│       ├── user/
│       │   └── user.factory.ts
│       └── vehicle/
│
├── infrastructure/             # Camada de Infraestrutura (Implementações)
│   ├── database/
│   │   ├── drizzle/
│   │   │   ├── schema/         # Schemas do Drizzle ORM
│   │   │   ├── connection.ts
│   │   │   ├── migrate.ts
│   │   │   └── seed.ts
│   │   └── repositories/       # Implementações concretas de repositórios
│   │       └── drizzle-user.repository.ts
│   │
│   ├── http/
│   │   ├── controllers/        # Orquestram use cases
│   │   │   └── user.controller.ts
│   │   └── validators/         # Validações Zod
│   │       └── user.validator.ts
│   │
│   └── di/                     # Dependency Injection
│       └── container.ts
│
└── presentation/               # Camada de Apresentação (HTTP)
    └── http/
        ├── routes/             # Definições de rotas
        │   ├── user.routes.ts
        │   └── server.ts       # Setup do servidor Elysia
        └── middleware/         # Middlewares (preparado)
```

## Camadas Arquiteturais

### 1. **Domain Layer** (Camada de Domínio)
- Contém a **lógica de negócio pura** independente de frameworks
- Não tem dependências externas
- Define contratos via interfaces
- **Artefatos principais:**
  - **Entities**: Objetos com identidade única (ex: `User`)
  - **Value Objects**: Objetos imutáveis sem identidade (ex: `Phone`, `Role`)
  - **Repositories (interfaces)**: Contratos de acesso a dados
  - **Domain Errors**: Exceções específicas do negócio

### 2. **Application Layer** (Camada de Aplicação)
- Orquestra a **lógica de negócio** definida no domínio
- Implementa casos de uso (Use Cases)
- Traduz entre DTOs e entidades de domínio
- **Artefatos principais:**
  - **Use Cases**: Implementam um caso de uso do negócio
  - **Factories**: Criam entidades complexas
  - **DTOs**: Definem inputs/outputs (sem lógica)

### 3. **Infrastructure Layer** (Camada de Infraestrutura)
- Implementações **concretas** de abstrações do domínio
- Acesso a recursos externos (banco de dados, APIs, etc.)
- **Artefatos principais:**
  - **Repository Implementations**: Usam Drizzle ORM
  - **Controllers**: Orquestram requisições HTTP
  - **Validators**: Validações Zod para entrada HTTP
  - **DI Container**: Gerencia dependências

### 4. **Presentation Layer** (Camada de Apresentação)
- Apenas **define rotas** e mapeia requisições
- Delega toda lógica para controllers
- Usa o DI Container para obter dependências
- **Artefatos principais:**
  - **Routes**: Definem endpoints HTTP

## Padrões Utilizados

### SOLID Principles

| Princípio | Implementação |
|-----------|---------------|
| **S** - Single Responsibility | Cada classe tem uma única responsabilidade (Use Cases, Entities, Controllers) |
| **O** - Open/Closed | Use cases são extensíveis via factories e value objects |
| **L** - Liskov Substitution | Repositories implementam a mesma interface |
| **I** - Interface Segregation | Interfaces segregadas por domínio (`IUserRepository`) |
| **D** - Dependency Inversion | Controllers e Use Cases dependem de abstrações (interfaces), não implementações |

### DDD Concepts

| Conceito | Exemplo |
|----------|---------|
| **Bounded Context** | `user`, `vehicle` (domínios isolados) |
| **Entity** | `User` - tem identidade única |
| **Value Object** | `Phone`, `Role` - sem identidade, imutáveis |
| **Repository** | `IUserRepository` - abstração de persistência |
| **Factory** | `UserFactory` - criação complexa de agregados |
| **Domain Error** | `InvalidPhoneError`, `UserNotFoundError` |

### Design Patterns

- **Result Pattern**: Encapsula sucesso/falha sem exceções (`Success<T>`, `Failure`)
- **Repository Pattern**: Abstrai acesso a dados
- **Factory Pattern**: Encapsula lógica de criação de entidades
- **Dependency Injection**: DIContainer gerencia dependências
- **Controller Pattern**: Orquestra requisições HTTP

## Fluxo de Uma Requisição

```
1. Route Handler (presentation/http/routes/user.routes.ts)
        ↓
2. Controller (infrastructure/http/controllers/user.controller.ts)
        ↓
3. Use Case (application/use-cases/user/create-user/create-user.use-case.ts)
        ↓
4. Factory (application/factories/user/user.factory.ts)
        ↓
5. Entity & Value Objects (domain/user/entities/user.entity.ts)
        ↓
6. Repository Interface (domain/user/repositories/user-repository.interface.ts)
        ↓
7. Repository Implementation (infrastructure/database/repositories/drizzle-user.repository.ts)
        ↓
8. Drizzle ORM → Database
```

## Exemplo: Criar Usuário

### 1. **Domain Layer** - Define a lógica
```typescript
// User Entity contém regras de negócio
const user = User.create({
  phone: Phone.create("11987654321").value,
  role: Role.create("CUSTOMER").value,
  name: "João Silva"
});
```

### 2. **Application Layer** - Orquestra
```typescript
// CreateUserUseCase usa factory e repository
const result = await createUserUseCase.execute({
  phone: "11987654321",
  role: "CUSTOMER",
  name: "João Silva"
});
```

### 3. **Infrastructure Layer** - Implementa
```typescript
// DrizzleUserRepository salva no banco
await userRepository.save(user);

// UserController valida e mapeia requisições
const response = await userController.create(requestBody);
```

### 4. **Presentation Layer** - Expõe
```typescript
// Route delega para controller
POST /api/v1/users → controller.create() → response
```

## Adicionando Novo Caso de Uso

### Passo 1: Domínio
```typescript
// domain/user/entities/user.entity.ts
updateName(newName: string): Result<void> {
  // Validação de negócio
  if (!newName) return fail(new InvalidUserDataError(...));
  this.props.name = newName;
  return ok(undefined);
}
```

### Passo 2: Aplicação
```typescript
// application/use-cases/user/update-user/update-user.use-case.ts
export class UpdateUserUseCase {
  async execute(dto: UpdateUserDTO): Promise<Result<void>> {
    const user = await this.userRepository.findById(dto.id);
    const result = user.updateName(dto.newName);
    if (result.isFailure) return result;
    await this.userRepository.update(user);
    return ok(undefined);
  }
}
```

### Passo 3: Infraestrutura
```typescript
// infrastructure/http/controllers/user.controller.ts
async update(id: string, name: string) {
  return await this.updateUserUseCase.execute({ id, newName: name });
}

// infrastructure/http/validators/user.validator.ts
export const updateUserSchema = z.object({...});
```

### Passo 4: Apresentação
```typescript
// presentation/http/routes/user.routes.ts
.patch('/users/:id', ({ params, body }) =>
  userController.update(params.id, body.name)
)
```

## Benefícios

✅ **Testabilidade**: Lógica isolada, fácil de testar
✅ **Manutenibilidade**: Código bem organizado e separado por responsabilidade
✅ **Escalabilidade**: Fácil adicionar novos casos de uso
✅ **Type-Safety**: TypeScript em todas as camadas
✅ **Flexibilidade**: Trocar Drizzle por outro ORM requer mudança apenas na infraestrutura
✅ **Observabilidade**: Erros específicos do domínio e resultado explícito

## Próximos Passos

- [ ] Implementar `get-user` use case
- [ ] Implementar `update-user` use case
- [ ] Adicionar `vehicle` domain
- [ ] Implementar autenticação e autorização
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
