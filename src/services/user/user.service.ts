import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { fail, ok, Result } from '@/shared'
import { Phone, Role, User, UserAlreadyExistsError, UserNotFoundError } from '@/models/user'
import { user as userSchema } from '@/infrastructure/database/drizzle/schema/users'

// DTOs
export interface CreateUserDTO {
  phone: string;
  role: string;
  name: string;
  email?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
}

export interface UserResponse {
  id: string;
  phone: string;
  role: string;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  constructor (private readonly db: PostgresJsDatabase<any>) {}

  // Use Case: Create User
  async create (dto: CreateUserDTO): Promise<Result<UserResponse>> {
    // Create value objects
    const phoneResult = Phone.create(dto.phone)
    if (phoneResult.isFailure) {
      return phoneResult
    }

    const roleResult = Role.create(dto.role)
    if (roleResult.isFailure) {
      return roleResult
    }

    // Create entity
    const phone = phoneResult.getOrThrow()
    const role = roleResult.getOrThrow()

    const userResult = User.create({
      phone,
      role,
      name: dto.name,
      email: dto.email
    })

    if (userResult.isFailure) {
      return userResult
    }

    const user = userResult.getOrThrow()

    // Check if user already exists
    const existingUserResult = await this.findByPhone(phone.getValue())
    if (existingUserResult.isSuccess) {
      return fail(new UserAlreadyExistsError(phone.getValue()))
    }

    // Save to database
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

      return ok({
        id: user.getId(),
        phone: props.phone.getValue(),
        role: props.role.getValue(),
        name: props.name,
        email: props.email,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      })
    } catch (error) {
      return fail(error as any)
    }
  }

  // Use Case: Get User by ID
  async getById (id: string): Promise<Result<UserResponse>> {
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

      return ok({
        id: userData.id,
        phone: userData.phone,
        role: userData.role,
        name: userData.name || '',
        email: userData.email || undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })
    } catch (error) {
      return fail(error as any)
    }
  }

  // Use Case: Find by Phone (internal helper + public method)
  async findByPhone (phone: string): Promise<Result<UserResponse>> {
    try {
      const record = await this.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.phone, phone))
        .limit(1)

      if (record.length === 0) {
        return fail(new UserNotFoundError(`Phone: ${phone}`))
      }

      const userData = record[0]

      return ok({
        id: userData.id,
        phone: userData.phone,
        role: userData.role,
        name: userData.name || '',
        email: userData.email || undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })
    } catch (error) {
      return fail(error as any)
    }
  }

  // Use Case: List All Users
  async listAll (): Promise<Result<UserResponse[]>> {
    try {
      const records = await this.db.select().from(userSchema)

      const users = records.map((userData) => ({
        id: userData.id,
        phone: userData.phone,
        role: userData.role,
        name: userData.name || '',
        email: userData.email || undefined,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }))

      return ok(users)
    } catch (error) {
      return fail(error as any)
    }
  }

  // Use Case: Update User
  async update (id: string, dto: UpdateUserDTO): Promise<Result<UserResponse>> {
    try {
      // Check if user exists
      const userResult = await this.getById(id)
      if (userResult.isFailure) {
        return userResult
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date()
      }

      if (dto.name) {
        updateData.name = dto.name
      }

      if (dto.email !== undefined) {
        updateData.email = dto.email
      }

      if (dto.role) {
        const roleResult = Role.create(dto.role)
        if (roleResult.isFailure) {
          return roleResult
        }
        updateData.role = roleResult.getOrThrow().getValue()
      }

      // Update in database
      await this.db
        .update(userSchema)
        .set(updateData)
        .where(eq(userSchema.id, id))

      // Return updated user
      return await this.getById(id)
    } catch (error) {
      return fail(error as any)
    }
  }

  // Use Case: Delete User
  async delete (id: string): Promise<Result<void>> {
    try {
      // Check if user exists
      const userResult = await this.getById(id)
      if (userResult.isFailure) {
        return userResult
      }

      await this.db.delete(userSchema).where(eq(userSchema.id, id))
      return ok(undefined as void)
    } catch (error) {
      return fail(error as any)
    }
  }
}
