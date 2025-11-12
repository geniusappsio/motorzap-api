import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { whatsappBusinessAccount } from './whatsapp-business-accounts'

export const phoneNameStatusEnum = pgEnum('phone_name_status', ['APPROVED', 'PENDING', 'REJECTED', 'NONE', 'EXPIRED'])
export const phoneCertificateStatusEnum = pgEnum('phone_certificate_status', ['VALID', 'EXPIRED', 'REVOKED', 'PENDING', 'NONE'])
export const phoneQualityRatingEnum = pgEnum('phone_quality_rating', ['GREEN', 'YELLOW', 'RED', 'NA'])
export const messagingLimitTierEnum = pgEnum('messaging_limit_tier', ['TIER_50', 'TIER_250', 'TIER_1K', 'TIER_10K', 'TIER_100K', 'TIER_UNLIMITED'])
export const phoneNumberStatusEnum = pgEnum('phone_number_status', ['CONNECTED', 'DISCONNECTED', 'MIGRATED', 'PENDING', 'DELETED', 'FLAGGED', 'RESTRICTED'])
export const phonePlatformTypeEnum = pgEnum('phone_platform_type', ['CLOUD_API', 'NOT_APPLICABLE'])
export const phoneAccountModeEnum = pgEnum('phone_account_mode', ['SANDBOX', 'LIVE'])
export const phoneThroughputLevelEnum = pgEnum('phone_throughput_level', ['STANDARD', 'HIGH'])
export const codeVerificationStatusEnum = pgEnum('code_verification_status', ['VERIFIED', 'NOT_VERIFIED', 'REVOKED'])

export const whatsappPhoneNumber = pgTable('tb_whatsapp_phone_numbers', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  internalId: serial('internal_id').notNull().unique(),

  // Relationship
  wabaId: uuid('waba_id')
    .notNull()
    .references(() => whatsappBusinessAccount.id, { onDelete: 'cascade' }),

  // Meta data
  metaPhoneNumberId: varchar('meta_phone_number_id', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  displayPhoneNumber: varchar('display_phone_number', { length: 30 }),

  // Verification and name
  verifiedName: varchar('verified_name', { length: 255 }),
  nameStatus: phoneNameStatusEnum('name_status'),
  certificate: text('certificate'),
  certificateStatus: phoneCertificateStatusEnum('certificate_status'),

  // Quality and limits
  qualityRating: phoneQualityRatingEnum('quality_rating'),
  messagingLimitTier: messagingLimitTierEnum('messaging_limit_tier'),
  currentLimit: integer('current_limit'),

  // Status
  status: phoneNumberStatusEnum('status').notNull(),
  platformType: phonePlatformTypeEnum('platform_type'),
  accountMode: phoneAccountModeEnum('account_mode'),

  // Configuration
  isPinEnabled: boolean('is_pin_enabled').default(false),
  pin: varchar('pin', { length: 6 }), // ENCRYPTED IN APPLICATION LAYER
  isOfficialBusinessAccount: boolean('is_official_business_account').default(false),

  // Throughput
  throughputLevel: phoneThroughputLevelEnum('throughput_level'),
  messagesPerSecond: integer('messages_per_second'),

  // Code verification
  codeVerificationStatus: codeVerificationStatusEnum('code_verification_status'),

  // Control
  isActive: boolean('is_active').notNull().default(true),
  lastStatusCheck: timestamp('last_status_check'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  index('idx_phone_number').on(table.phoneNumber),
  index('idx_waba_id_phone').on(table.wabaId),
  index('idx_status_quality').on(table.status, table.qualityRating)
])
