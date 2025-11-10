import { DomainError } from '../../shared/domain-error'

export class InvalidQualityRatingError extends DomainError {
  constructor (rating: string) {
    super(`Invalid quality rating: ${rating}. Must be one of: GREEN, YELLOW, RED, NA`)
    this.name = 'InvalidQualityRatingError'
  }
}

export class InvalidPhoneNumberE164Error extends DomainError {
  constructor (phone: string) {
    super(`Invalid E.164 phone number format: ${phone}. Must start with + and have 1-15 digits`)
    this.name = 'InvalidPhoneNumberE164Error'
  }
}

export class InvalidTemplateStatusError extends DomainError {
  constructor (status: string) {
    super(`Invalid template status: ${status}. Must be one of: PENDING, APPROVED, REJECTED, PAUSED, DISABLED, ARCHIVED`)
    this.name = 'InvalidTemplateStatusError'
  }
}

export class InvalidFlowStatusError extends DomainError {
  constructor (status: string) {
    super(`Invalid flow status: ${status}. Must be one of: DRAFT, PUBLISHED, DEPRECATED, BLOCKED, THROTTLED`)
    this.name = 'InvalidFlowStatusError'
  }
}

export class InvalidTemplateCategoryError extends DomainError {
  constructor (category: string) {
    super(`Invalid template category: ${category}. Must be one of: MARKETING, UTILITY, AUTHENTICATION`)
    this.name = 'InvalidTemplateCategoryError'
  }
}

export class InvalidFlowCategoryError extends DomainError {
  constructor (category: string) {
    super(`Invalid flow category: ${category}. Must be one of: SIGN_UP, SIGN_IN, APPOINTMENT_BOOKING, LEAD_GENERATION, CONTACT_US, CUSTOMER_SUPPORT, SURVEY, OTHER`)
    this.name = 'InvalidFlowCategoryError'
  }
}

export class InvalidBusinessManagerDataError extends DomainError {
  constructor (message: string) {
    super(message)
    this.name = 'InvalidBusinessManagerDataError'
  }
}

export class InvalidWhatsAppBusinessAccountDataError extends DomainError {
  constructor (message: string) {
    super(message)
    this.name = 'InvalidWhatsAppBusinessAccountDataError'
  }
}

export class InvalidWhatsAppPhoneNumberDataError extends DomainError {
  constructor (message: string) {
    super(message)
    this.name = 'InvalidWhatsAppPhoneNumberDataError'
  }
}

export class InvalidWhatsAppFlowDataError extends DomainError {
  constructor (message: string) {
    super(message)
    this.name = 'InvalidWhatsAppFlowDataError'
  }
}

export class InvalidWhatsAppMessageTemplateDataError extends DomainError {
  constructor (message: string) {
    super(message)
    this.name = 'InvalidWhatsAppMessageTemplateDataError'
  }
}
