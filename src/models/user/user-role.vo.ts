import { fail, ok, Result } from '@/shared'
import { InvalidUserRoleError } from './user-errors'

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
}

export class Role {
  private readonly value: UserRole

  private constructor (value: UserRole) {
    this.value = value
  }

  static create (role: string): Result<Role> {
    const normalizedRole = role.toUpperCase()

    if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
      return fail(new InvalidUserRoleError(role))
    }

    return ok(new Role(normalizedRole as UserRole))
  }

  static createUnsafe (role: UserRole): Role {
    return new Role(role)
  }

  getValue (): UserRole {
    return this.value
  }

  isAdmin (): boolean {
    return this.value === UserRole.ADMIN
  }

  isManager (): boolean {
    return this.value === UserRole.MANAGER
  }

  isCustomer (): boolean {
    return this.value === UserRole.CUSTOMER
  }

  equals (other: Role): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
