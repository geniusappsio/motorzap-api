import { boolean, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const businessVerificationStatusEnum = pgEnum('business_verification_status', ['VERIFIED', 'UNVERIFIED', 'PENDING', 'REJECTED'])
export const businessTypeEnum = pgEnum('business_type', ['SMALL_BUSINESS', 'MEDIUM_BUSINESS', 'ENTERPRISE', 'INDIVIDUAL', 'OTHER'])

export const businessManager = pgTable('tb_business_managers', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  internalId: serial('internal_id').notNull().unique(),

  // Meta data
  metaBusinessId: varchar('meta_business_id', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }),
  verificationStatus: businessVerificationStatusEnum('verification_status'),

  // Credentials (ENCRYPTED IN APPLICATION LAYER)
  accessToken: text('access_token').notNull(),

  // Sync control
  lastSyncedAt: timestamp('last_synced_at'),

  // Flow certificates (ENCRYPTED IN APPLICATION LAYER)
  flowCertificate: text('flow_certificate_private'),
  flowCertificatePassword: text('flow_certificate_password'),

  // Metadata
  businessType: businessTypeEnum('business_type'),
  timezone: varchar('timezone', { length: 100 }),
  currency: varchar('currency', { length: 3 }),

  // Control
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
