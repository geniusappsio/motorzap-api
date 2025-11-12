// Quality Rating Enum (simplified from value object)
export enum QualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN'
}

// Template Status Enum
export enum TemplateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED'
}

// Template Category Enum
export enum TemplateCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY'
}

// Flow Status Enum
export enum FlowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
  BLOCKED = 'BLOCKED'
}

// Flow Category Enum
export enum FlowCategory {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  APPOINTMENT_BOOKING = 'APPOINTMENT_BOOKING',
  LEAD_GENERATION = 'LEAD_GENERATION',
  CONTACT_US = 'CONTACT_US',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  SURVEY = 'SURVEY',
  OTHER = 'OTHER'
}
