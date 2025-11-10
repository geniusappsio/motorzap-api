CREATE TYPE "public"."business_type" AS ENUM('SMALL_BUSINESS', 'MEDIUM_BUSINESS', 'ENTERPRISE', 'INDIVIDUAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."business_verification_status" AS ENUM('VERIFIED', 'UNVERIFIED', 'PENDING', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."waba_business_verification" AS ENUM('VERIFIED', 'UNVERIFIED', 'PENDING', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."waba_ownership_type" AS ENUM('OWNED', 'CLIENT', 'SHARED');--> statement-breakpoint
CREATE TYPE "public"."waba_review_status" AS ENUM('APPROVED', 'PENDING', 'REJECTED', 'RESTRICTED');--> statement-breakpoint
CREATE TYPE "public"."flow_asset_type" AS ENUM('FLOW_JSON', 'IMAGE', 'VIDEO', 'DOCUMENT');--> statement-breakpoint
CREATE TYPE "public"."flow_data_api_version" AS ENUM('3.0', '3.1');--> statement-breakpoint
CREATE TYPE "public"."flow_health_status" AS ENUM('HEALTHY', 'UNHEALTHY', 'WARNING', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."flow_json_version" AS ENUM('2.1', '3.0', '3.1');--> statement-breakpoint
CREATE TYPE "public"."flow_status" AS ENUM('DRAFT', 'PUBLISHED', 'DEPRECATED', 'BLOCKED', 'THROTTLED');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('MARKETING', 'UTILITY', 'AUTHENTICATION');--> statement-breakpoint
CREATE TYPE "public"."template_quality_score" AS ENUM('HIGH', 'MEDIUM', 'LOW', 'PENDING', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."code_verification_status" AS ENUM('VERIFIED', 'NOT_VERIFIED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."messaging_limit_tier" AS ENUM('TIER_50', 'TIER_250', 'TIER_1K', 'TIER_10K', 'TIER_100K', 'TIER_UNLIMITED');--> statement-breakpoint
CREATE TYPE "public"."phone_account_mode" AS ENUM('SANDBOX', 'LIVE');--> statement-breakpoint
CREATE TYPE "public"."phone_certificate_status" AS ENUM('VALID', 'EXPIRED', 'REVOKED', 'PENDING', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."phone_name_status" AS ENUM('APPROVED', 'PENDING', 'REJECTED', 'NONE', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."phone_number_status" AS ENUM('CONNECTED', 'DISCONNECTED', 'MIGRATED', 'PENDING', 'DELETED', 'FLAGGED', 'RESTRICTED');--> statement-breakpoint
CREATE TYPE "public"."phone_platform_type" AS ENUM('CLOUD_API', 'NOT_APPLICABLE');--> statement-breakpoint
CREATE TYPE "public"."phone_quality_rating" AS ENUM('GREEN', 'YELLOW', 'RED', 'NA');--> statement-breakpoint
CREATE TYPE "public"."phone_throughput_level" AS ENUM('STANDARD', 'HIGH');--> statement-breakpoint
CREATE TABLE "tb_business_managers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"internal_id" serial NOT NULL,
	"meta_business_id" varchar(255),
	"name" varchar(255),
	"verification_status" "business_verification_status",
	"access_token" text NOT NULL,
	"last_synced_at" timestamp,
	"flow_certificate_private" text,
	"flow_certificate_password" text,
	"business_type" "business_type",
	"timezone" varchar(100),
	"currency" varchar(3),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_business_managers_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "tb_business_managers_meta_business_id_unique" UNIQUE("meta_business_id")
);
--> statement-breakpoint
CREATE TABLE "tb_whatsapp_business_accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"internal_id" serial NOT NULL,
	"business_manager_id" uuid NOT NULL,
	"meta_waba_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"timezone_id" varchar(10),
	"message_template_namespace" varchar(255),
	"account_review_status" "waba_review_status",
	"business_verification_status" "waba_business_verification",
	"ownership_type" "waba_ownership_type",
	"conversation_analytics_enabled" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_whatsapp_business_accounts_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "tb_whatsapp_business_accounts_meta_waba_id_unique" UNIQUE("meta_waba_id"),
	CONSTRAINT "tb_whatsapp_business_accounts_message_template_namespace_unique" UNIQUE("message_template_namespace")
);
--> statement-breakpoint
CREATE TABLE "tb_whatsapp_flows" (
	"id" uuid PRIMARY KEY NOT NULL,
	"internal_id" serial NOT NULL,
	"waba_id" uuid NOT NULL,
	"meta_flow_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "flow_status" NOT NULL,
	"categories" text[],
	"flow_json" jsonb,
	"json_version" "flow_json_version",
	"data_api_version" "flow_data_api_version",
	"data_channel_uri" varchar(500),
	"endpoint_uri" varchar(500),
	"preview_url" varchar(500),
	"preview_expires_at" timestamp,
	"validation_errors" jsonb,
	"last_validation_at" timestamp,
	"can_send_message" "flow_health_status",
	"health_status_details" jsonb,
	"last_health_check_at" timestamp,
	"assets_count" integer DEFAULT 0,
	"total_sent" integer DEFAULT 0,
	"total_completed" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"deprecated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_whatsapp_flows_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "tb_whatsapp_flows_meta_flow_id_unique" UNIQUE("meta_flow_id")
);
--> statement-breakpoint
CREATE TABLE "tb_whatsapp_flow_assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"flow_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"asset_type" "flow_asset_type" NOT NULL,
	"download_url" varchar(500),
	"url_expires_at" timestamp,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_whatsapp_message_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"internal_id" serial NOT NULL,
	"waba_id" uuid NOT NULL,
	"meta_template_id" varchar(255) NOT NULL,
	"name" varchar(512) NOT NULL,
	"language" varchar(10) NOT NULL,
	"status" "template_status" NOT NULL,
	"category" "template_category" NOT NULL,
	"previous_category" "template_category",
	"components" jsonb NOT NULL,
	"rejected_reason" text,
	"rejected_at" timestamp,
	"quality_score" "template_quality_score",
	"quality_score_date" timestamp,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_read" integer DEFAULT 0,
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_whatsapp_message_templates_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "tb_whatsapp_message_templates_meta_template_id_unique" UNIQUE("meta_template_id"),
	CONSTRAINT "unique_waba_name_language" UNIQUE("waba_id","name","language")
);
--> statement-breakpoint
CREATE TABLE "tb_whatsapp_phone_numbers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"internal_id" serial NOT NULL,
	"waba_id" uuid NOT NULL,
	"meta_phone_number_id" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"display_phone_number" varchar(30),
	"verified_name" varchar(255),
	"name_status" "phone_name_status",
	"certificate" text,
	"certificate_status" "phone_certificate_status",
	"quality_rating" "phone_quality_rating",
	"messaging_limit_tier" "messaging_limit_tier",
	"current_limit" integer,
	"status" "phone_number_status" NOT NULL,
	"platform_type" "phone_platform_type",
	"account_mode" "phone_account_mode",
	"is_pin_enabled" boolean DEFAULT false,
	"pin" varchar(6),
	"is_official_business_account" boolean DEFAULT false,
	"throughput_level" "phone_throughput_level",
	"messages_per_second" integer,
	"code_verification_status" "code_verification_status",
	"is_active" boolean DEFAULT true NOT NULL,
	"last_status_check" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_whatsapp_phone_numbers_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "tb_whatsapp_phone_numbers_meta_phone_number_id_unique" UNIQUE("meta_phone_number_id"),
	CONSTRAINT "tb_whatsapp_phone_numbers_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "tb_whatsapp_business_accounts" ADD CONSTRAINT "tb_whatsapp_business_accounts_business_manager_id_tb_business_managers_id_fk" FOREIGN KEY ("business_manager_id") REFERENCES "public"."tb_business_managers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_whatsapp_flows" ADD CONSTRAINT "tb_whatsapp_flows_waba_id_tb_whatsapp_business_accounts_id_fk" FOREIGN KEY ("waba_id") REFERENCES "public"."tb_whatsapp_business_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_whatsapp_flow_assets" ADD CONSTRAINT "tb_whatsapp_flow_assets_flow_id_tb_whatsapp_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."tb_whatsapp_flows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_whatsapp_message_templates" ADD CONSTRAINT "tb_whatsapp_message_templates_waba_id_tb_whatsapp_business_accounts_id_fk" FOREIGN KEY ("waba_id") REFERENCES "public"."tb_whatsapp_business_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_whatsapp_phone_numbers" ADD CONSTRAINT "tb_whatsapp_phone_numbers_waba_id_tb_whatsapp_business_accounts_id_fk" FOREIGN KEY ("waba_id") REFERENCES "public"."tb_whatsapp_business_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_waba_id_flow" ON "tb_whatsapp_flows" USING btree ("waba_id");--> statement-breakpoint
CREATE INDEX "idx_flow_status" ON "tb_whatsapp_flows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_waba_id_template" ON "tb_whatsapp_message_templates" USING btree ("waba_id");--> statement-breakpoint
CREATE INDEX "idx_template_status" ON "tb_whatsapp_message_templates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_template_category" ON "tb_whatsapp_message_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_template_name_lang" ON "tb_whatsapp_message_templates" USING btree ("name","language");--> statement-breakpoint
CREATE INDEX "idx_phone_number" ON "tb_whatsapp_phone_numbers" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_waba_id_phone" ON "tb_whatsapp_phone_numbers" USING btree ("waba_id");--> statement-breakpoint
CREATE INDEX "idx_status_quality" ON "tb_whatsapp_phone_numbers" USING btree ("status","quality_rating");