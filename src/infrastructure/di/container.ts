import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DrizzleUserRepository } from '../database/repositories/drizzle-user.repository';
import { CreateUserUseCase } from '../../application/use-cases/user';
import { UserController } from '../http/controllers/user.controller';

export class DIContainer {
  private static instance: DIContainer;

  private db: PostgresJsDatabase<any>;

  private constructor(db: PostgresJsDatabase<any>) {
    this.db = db;
  }

  static initialize(db: PostgresJsDatabase<any>): DIContainer {
    if (!this.instance) {
      this.instance = new DIContainer(db);
    }
    return this.instance;
  }

  static getInstance(): DIContainer {
    if (!this.instance) {
      throw new Error('DIContainer not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  // User repositories
  getUserRepository() {
    return new DrizzleUserRepository(this.db);
  }

  // User use cases
  getCreateUserUseCase(): CreateUserUseCase {
    const userRepository = this.getUserRepository();
    return new CreateUserUseCase(userRepository);
  }

  // User controllers
  getUserController(): UserController {
    const createUserUseCase = this.getCreateUserUseCase();
    return new UserController(createUserUseCase);
  }
}
