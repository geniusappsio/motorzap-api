CREATE TYPE "public"."vehicle_type" AS ENUM('cars', 'motorcycles', 'trucks');--> statement-breakpoint
CREATE TABLE "tb_vehicle_details" (
	"id" uuid PRIMARY KEY NOT NULL,
	"brand" varchar NOT NULL,
	"code_fipe" varchar NOT NULL,
	"fuel" varchar NOT NULL,
	"fuel_acronym" varchar NOT NULL,
	"model" varchar NOT NULL,
	"model_year" varchar NOT NULL,
	"price" varchar NOT NULL,
	"price_history" jsonb,
	"reference_month" varchar NOT NULL,
	"vehicle_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_vehicle_details_code_fipe_unique" UNIQUE("code_fipe")
);
--> statement-breakpoint
CREATE TABLE "tb_vehicle_years" (
	"code" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
