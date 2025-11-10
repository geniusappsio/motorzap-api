import { fail, ok, Result } from '../../shared'
import { InvalidFlowCategoryError } from '../errors/whatsapp-errors'

export enum FlowCategoryEnum {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
  LEAD_GENERATION = 'LEAD_GENERATION',
  CONTACT_US = 'CONTACT_US',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  SURVEY = 'SURVEY',
  OTHER = 'OTHER',
}

export class FlowCategory {
  private readonly value: FlowCategoryEnum

  private constructor (value: FlowCategoryEnum) {
    this.value = value
  }

  static create (category: string): Result<FlowCategory> {
    const normalizedCategory = category.toUpperCase()

    if (!Object.values(FlowCategoryEnum).includes(normalizedCategory as FlowCategoryEnum)) {
      return fail(new InvalidFlowCategoryError(category))
    }

    return ok(new FlowCategory(normalizedCategory as FlowCategoryEnum))
  }

  static createUnsafe (category: FlowCategoryEnum): FlowCategory {
    return new FlowCategory(category)
  }

  getValue (): FlowCategoryEnum {
    return this.value
  }

  equals (other: FlowCategory): boolean {
    return this.value === other.value
  }

  toString (): string {
    return this.value
  }
}
