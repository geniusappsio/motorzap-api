import { DomainError } from '@/shared'

export class InvalidPhoneError extends DomainError {
  constructor (phone: string) {
    super(
      'INVALID_PHONE',
      `Invalid phone number: ${phone}`,
      400
    )
  }
}

export class InvalidUserRoleError extends DomainError {
  constructor (role: string) {
    super(
      'INVALID_USER_ROLE',
      `Invalid user role: ${role}`,
      400
    )
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor (phone: string) {
    super(
      'USER_ALREADY_EXISTS',
      `User with phone ${phone} already exists`,
      409
    )
  }
}

export class UserNotFoundError extends DomainError {
  constructor (id: string) {
    super(
      'USER_NOT_FOUND',
      `User with id ${id} not found`,
      404
    )
  }
}

export class InvalidUserDataError extends DomainError {
  constructor (message: string) {
    super(
      'INVALID_USER_DATA',
      message,
      400
    )
  }
}
