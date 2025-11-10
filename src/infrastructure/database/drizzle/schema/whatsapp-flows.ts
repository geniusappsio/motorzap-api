import { boolean, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { whatsappBusinessAccount } from './whatsapp-business-accounts'

export const flowStatusEnum = pgEnum('flow_status', ['DRAFT', 'PUBLISHED', 'DEPRECATED', 'BLOCKED', 'THROTTLED'])
export const flowJsonVersionEnum = pgEnum('flow_json_version', ['2.1', '3.0', '3.1'])
export const flowDataApiVersionEnum = pgEnum('flow_data_api_version', ['3.0', '3.1'])
export const flowHealthStatusEnum = pgEnum('flow_health_status', ['HEALTHY', 'UNHEALTHY', 'WARNING', 'UNKNOWN'])
export const flowAssetTypeEnum = pgEnum('flow_asset_type', ['FLOW_JSON', 'IMAGE', 'VIDEO', 'DOCUMENT'])

export const whatsappFlow = pgTable('tb_whatsapp_flows', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  internalId: serial('internal_id').notNull().unique(),

  // Relationship
  wabaId: uuid('waba_id')
    .notNull()
    .references(() => whatsappBusinessAccount.id, { onDelete: 'cascade' }),

  // Meta data
  metaFlowId: varchar('meta_flow_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),

  // Status
  status: flowStatusEnum('status').notNull(),

  // Categories (array)
  categories: text('categories').array(),

  // JSON of flow
  flowJson: jsonb('flow_json'),
  jsonVersion: flowJsonVersionEnum('json_version'),

  // Data API
  dataApiVersion: flowDataApiVersionEnum('data_api_version'),
  dataChannelUri: varchar('data_channel_uri', { length: 500 }),
  endpointUri: varchar('endpoint_uri', { length: 500 }),

  // Preview
  previewUrl: varchar('preview_url', { length: 500 }),
  previewExpiresAt: timestamp('preview_expires_at'),

  // Validation
  validationErrors: jsonb('validation_errors'),
  lastValidationAt: timestamp('last_validation_at'),

  // Health status
  canSendMessage: flowHealthStatusEnum('can_send_message'),
  healthStatusDetails: jsonb('health_status_details'),
  lastHealthCheckAt: timestamp('last_health_check_at'),

  // Assets
  assetsCount: integer('assets_count').default(0),

  // Metrics
  totalSent: integer('total_sent').default(0),
  totalCompleted: integer('total_completed').default(0),

  // Control
  isActive: boolean('is_active').notNull().default(true),
  publishedAt: timestamp('published_at'),
  deprecatedAt: timestamp('deprecated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  index('idx_waba_id_flow').on(table.wabaId),
  index('idx_flow_status').on(table.status)
])

// Flow assets table
export const whatsappFlowAsset = pgTable('tb_whatsapp_flow_assets', {
  id: uuid('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),

  flowId: uuid('flow_id')
    .notNull()
    .references(() => whatsappFlow.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  assetType: flowAssetTypeEnum('asset_type').notNull(),
  downloadUrl: varchar('download_url', { length: 500 }),
  urlExpiresAt: timestamp('url_expires_at'),

  content: text('content'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
