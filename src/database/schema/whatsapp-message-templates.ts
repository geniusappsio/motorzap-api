import { boolean, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

import { whatsappBusinessAccount } from './whatsapp-business-accounts'

export const templateStatusEnum = pgEnum('template_status', ['PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'ARCHIVED'])
export const templateCategoryEnum = pgEnum('template_category', ['MARKETING', 'UTILITY', 'AUTHENTICATION'])
export const templateQualityScoreEnum = pgEnum('template_quality_score', ['HIGH', 'MEDIUM', 'LOW', 'PENDING', 'UNKNOWN'])

export const whatsappMessageTemplate = pgTable('tb_whatsapp_message_templates', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  internalId: serial('internal_id').notNull().unique(),

  // Relationship
  wabaId: uuid('waba_id')
    .notNull()
    .references(() => whatsappBusinessAccount.id, { onDelete: 'cascade' }),

  // Meta data
  metaTemplateId: varchar('meta_template_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 512 }).notNull(),

  // Language
  language: varchar('language', { length: 10 }).notNull(),

  // Status
  status: templateStatusEnum('status').notNull(),

  // Category
  category: templateCategoryEnum('category').notNull(),
  previousCategory: templateCategoryEnum('previous_category'),

  // Components (structure of template)
  components: jsonb('components').notNull(),

  // Rejection
  rejectedReason: text('rejected_reason'),
  rejectedAt: timestamp('rejected_at'),

  // Quality score
  qualityScore: templateQualityScoreEnum('quality_score'),
  qualityScoreDate: timestamp('quality_score_date'),

  // Metrics
  totalSent: integer('total_sent').default(0),
  totalDelivered: integer('total_delivered').default(0),
  totalRead: integer('total_read').default(0),
  lastUsedAt: timestamp('last_used_at'),

  // Control
  isActive: boolean('is_active').notNull().default(true),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  index('idx_waba_id_template').on(table.wabaId),
  index('idx_template_status').on(table.status),
  index('idx_template_category').on(table.category),
  index('idx_template_name_lang').on(table.name, table.language),
  unique('unique_waba_name_language').on(table.wabaId, table.name, table.language)
])
