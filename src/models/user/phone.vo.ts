import { fail, ok, Result } from '@/shared'

import { InvalidPhoneError } from './user-errors'

export class Phone {
  private readonly value: string

  private constructor (value: string) {
    this.value = value
  }

  static create (phone: string): Result<Phone> {
    const cleaned = phone.replace(/\D/g, '')

    // Brazilian phone validation: 11 digits (2 area code + 9 digits)
    if (cleaned.length !== 11) {
      return fail(new InvalidPhoneError(phone))
    }

    return ok(new Phone(cleaned))
  }

  static createUnsafe (phone: string): Phone {
    return new Phone(phone.replace(/\D/g, ''))
  }

  getValue (): string {
    return this.value
  }

  getFormatted (): string {
    return `+55${this.value.slice(0, 2)} ${this.value.slice(2, 7)}-${this.value.slice(7)}`
  }

  equals (other: Phone): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
