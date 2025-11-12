import { fail, ok, Result } from '@/shared'
import { InvalidPhoneNumberE164Error } from './whatsapp-errors'

export class PhoneNumberE164 {
  private readonly value: string

  private constructor (value: string) {
    this.value = value
  }

  static create (phone: string): Result<PhoneNumberE164> {
    // Remove all non-digit characters except leading +
    const cleaned = phone.trim()

    // E.164 format: +[country code][number]
    // Must start with + and have 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/

    if (!e164Regex.test(cleaned)) {
      return fail(new InvalidPhoneNumberE164Error(phone))
    }

    return ok(new PhoneNumberE164(cleaned))
  }

  static createUnsafe (phone: string): PhoneNumberE164 {
    return new PhoneNumberE164(phone)
  }

  getValue (): string {
    return this.value
  }

  getFormatted (): string {
    // Format for Brazilian numbers: +55 11 99999-9999
    if (this.value.startsWith('+55') && this.value.length === 14) {
      const areaCode = this.value.slice(3, 5)
      const firstPart = this.value.slice(5, 10)
      const secondPart = this.value.slice(10)
      return `+55 ${areaCode} ${firstPart}-${secondPart}`
    }

    // For other countries, just return the value
    return this.value
  }

  equals (other: PhoneNumberE164): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
