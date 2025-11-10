import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { UserFactory } from '../../../application/factories/user/user.factory'
import type { Result } from '../../../domain/shared'
import { fail, ok } from '../../../domain/shared'
import { IUserRepository, Phone, User, UserNotFoundError } from '../../../domain/user'
import { user as userSchema } from '../drizzle/schema/users'

export class DrizzleUserRepository implements IUserRepository {
  private readonly userFactory: UserFactory

  constructor (private readonly db: PostgresJsDatabase<any>) {
    this.userFactory = new UserFactory()
  }

  async save (user: User): Promise<Result<void>> {
    try {
      const props = user.getProps()

      await this.db.insert(userSchema).values({
        id: user.getId(),
        phone: props.phone.getValue(),
        role: props.role.getValue(),
        name: props.name,
        email: props.email,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      })

      return ok(undefined as void)
    } catch (error) {
      // You might want to handle specific database errors here
      return fail(error as any)
    }
  }

  async findById (id: string): Promise<Result<User>> {
    try {
      const record = await this.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, id))
        .limit(1)

      if (record.length === 0) {
        return fail(new UserNotFoundError(id))
      }

      const userData = record[0]
      const user = this.userFactory.reconstitute({
        id: userData.id,
        phone: userData.phone,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })

      return ok(user)
    } catch (error) {
      return fail(error as any)
    }
  }

  async findByPhone (phone: Phone): Promise<Result<User>> {
    try {
      const record = await this.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.phone, phone.getValue()))
        .limit(1)

      if (record.length === 0) {
        return fail(new UserNotFoundError(`Phone: ${phone.getValue()}`))
      }

      const userData = record[0]
      const user = this.userFactory.reconstitute({
        id: userData.id,
        phone: userData.phone,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })

      return ok(user)
    } catch (error) {
      return fail(error as any)
    }
  }

  async update (user: User): Promise<Result<void>> {
    try {
      const props = user.getProps()

      await this.db
        .update(userSchema)
        .set({
          role: props.role.getValue(),
          name: props.name,
          email: props.email,
          updatedAt: props.updatedAt
        })
        .where(eq(userSchema.id, user.getId()))

      return ok(undefined as void)
    } catch (error) {
      return fail(error as any)
    }
  }

  async delete (id: string): Promise<Result<void>> {
    try {
      await this.db.delete(userSchema).where(eq(userSchema.id, id))
      return ok(undefined as void)
    } catch (error) {
      return fail(error as any)
    }
  }

  async findAll (): Promise<Result<User[]>> {
    try {
      const records = await this.db.select().from(userSchema)

      const users = records.map((userData) =>
        this.userFactory.reconstitute({
          id: userData.id,
          phone: userData.phone,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        })
      )

      return ok(users)
    } catch (error) {
      return fail(error as any)
    }
  }
}
