import type { DomainError } from './domain-error'

export type Result<T> = Success<T> | Failure;

export class Success<T> {
  readonly isSuccess = true
  readonly isFailure = false

  constructor (readonly value: T) {}

  getOrThrow (): T {
    return this.value
  }

  map<U> (fn: (value: T) => U): Result<U> {
    return new Success(fn(this.value))
  }

  async mapAsync<U> (fn: (value: T) => Promise<U>): Promise<Result<U>> {
    try {
      const value = await fn(this.value)
      return new Success(value)
    } catch (error) {
      return new Failure(error as DomainError)
    }
  }

  flatMap<U> (fn: (value: T) => Result<U>): Result<U> {
    return fn(this.value)
  }

  fold<U> (onFailure: (error: DomainError) => U, onSuccess: (value: T) => U): U {
    return onSuccess(this.value)
  }
}

export class Failure {
  readonly isSuccess = false
  readonly isFailure = true

  constructor (readonly error: DomainError) {}

  getOrThrow (): never {
    throw this.error
  }

  map<U> (): Result<U> {
    return this as any
  }

  async mapAsync<U> (): Promise<Result<U>> {
    return this as any
  }

  flatMap<U> (): Result<U> {
    return this as any
  }

  fold<U> (onFailure: (error: DomainError) => U): U {
    return onFailure(this.error)
  }
}

export const ok = <T>(value: T): Result<T> => new Success(value)
export const fail = (error: DomainError): Failure => new Failure(error)
