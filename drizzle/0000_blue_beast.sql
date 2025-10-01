CREATE TYPE "public"."user_role" AS ENUM('MANAGER', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "tb_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'CUSTOMER' NOT NULL,
	"name" varchar(255),
	"phone" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_users_phone_unique" UNIQUE("phone")
);
