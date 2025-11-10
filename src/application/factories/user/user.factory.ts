import type { Result } from '../../../domain/shared'
import { Phone, Role, User } from '../../../domain/user'

export interface CreateUserData {
  phone: string;
  role: string;
  name: string;
  email?: string;
}

export interface UserPersistenceData {
  id: string;
  phone: string;
  role: string;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserFactory {
  create (data: CreateUserData): Result<User> {
    // Create value objects
    const phoneResult = Phone.create(data.phone)
    if (phoneResult.isFailure) {
      return phoneResult
    }

    const roleResult = Role.create(data.role)
    if (roleResult.isFailure) {
      return roleResult
    }

    // Create entity
    const phone = phoneResult.getOrThrow()
    const role = roleResult.getOrThrow()

    return User.create({
      phone,
      role,
      name: data.name,
      email: data.email
    })
  }

  reconstitute (data: UserPersistenceData): User {
    const phone = Phone.createUnsafe(data.phone)
    const role = Role.createUnsafe(data.role as any)

    return User.reconstitute({
      id: data.id,
      phone,
      role,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
}
