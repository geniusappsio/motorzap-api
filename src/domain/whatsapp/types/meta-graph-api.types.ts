// Meta Graph API Response Types

export interface MetaGraphAPIError {
  message: string
  type: string
  code: number
  error_subcode?: number
  fbtrace_id: string
}

export interface MetaGraphAPIErrorResponse {
  error: MetaGraphAPIError
}

// Business Manager Types
export interface MetaBusiness {
  id: string
  name: string
  verification_status?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'REJECTED'
}

export interface MetaBusinessesResponse {
  data: MetaBusiness[]
  paging?: {
    cursors?: {
      before: string
      after: string
    }
  }
}

// WABA Types
export interface MetaWABA {
  id: string
  name: string
  currency: string
  timezone_id: string
  message_template_namespace: string
  account_review_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'RESTRICTED'
  business_verification_status?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'FAILED'
}

export interface MetaWABAsResponse {
  data: MetaWABA[]
  paging?: {
    cursors?: {
      before: string
      after: string
    }
  }
}

// Phone Number Types
export interface MetaPhoneNumber {
  id: string
  verified_name: string
  display_phone_number: string
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'NA'
  platform_type?: 'CLOUD_API' | 'NOT_APPLICABLE'
  throughput?: {
    level: 'STANDARD' | 'HIGH'
  }
  name_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE' | 'EXPIRED'
  status?: 'CONNECTED' | 'DISCONNECTED' | 'MIGRATED' | 'PENDING' | 'DELETED' | 'FLAGGED' | 'RESTRICTED'
  certificate?: string
  code_verification_status?: 'VERIFIED' | 'NOT_VERIFIED' | 'REVOKED'
  messaging_limit_tier?: 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED'
  is_official_business_account?: boolean
}

export interface MetaPhoneNumbersResponse {
  data: MetaPhoneNumber[]
  paging?: {
    cursors?: {
      before: string
      after: string
    }
  }
}

// Business Profile Types
export interface MetaBusinessProfile {
  about?: string
  address?: string
  description?: string
  email?: string
  profile_picture_url?: string
  websites?: string[]
  vertical?: string
}

export interface MetaBusinessProfileResponse {
  data: Array<{
    business_profile: MetaBusinessProfile
    id: string
  }>
}

// Me endpoint response
export interface MetaMeResponse {
  id: string
  name: string
}
