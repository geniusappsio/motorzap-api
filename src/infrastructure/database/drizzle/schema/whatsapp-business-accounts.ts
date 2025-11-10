import { boolean, pgEnum, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { businessManager } from './business-managers'

export const wabaReviewStatusEnum = pgEnum('waba_review_status', ['APPROVED', 'PENDING', 'REJECTED', 'RESTRICTED'])
export const wabaBusinessVerificationEnum = pgEnum('waba_business_verification', ['VERIFIED', 'UNVERIFIED', 'PENDING', 'FAILED'])
export const wabaOwnershipTypeEnum = pgEnum('waba_ownership_type', ['OWNED', 'CLIENT', 'SHARED'])

export const whatsappBusinessAccount = pgTable('tb_whatsapp_business_accounts', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  internalId: serial('internal_id').notNull().unique(),

  // Relationship
  businessManagerId: uuid('business_manager_id')
    .notNull()
    .references(() => businessManager.id, { onDelete: 'cascade' }),

  // Meta data
  metaWabaId: varchar('meta_waba_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),

  // Configuration
  currency: varchar('currency', { length: 3 }).notNull(),
  timezoneId: varchar('timezone_id', { length: 10 }),
  messageTemplateNamespace: varchar('message_template_namespace', { length: 255 }).unique(),

  // Status and verification
  accountReviewStatus: wabaReviewStatusEnum('account_review_status'),
  businessVerificationStatus: wabaBusinessVerificationEnum('business_verification_status'),
  ownershipType: wabaOwnershipTypeEnum('ownership_type'),

  // Analytics
  conversationAnalyticsEnabled: boolean('conversation_analytics_enabled').default(false),

  // Control
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
