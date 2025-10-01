ALTER TYPE "public"."user_role" ADD VALUE 'ADMIN';--> statement-breakpoint
ALTER TABLE "tb_users" ADD COLUMN "internal_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "tb_users" ADD CONSTRAINT "tb_users_internal_id_unique" UNIQUE("internal_id");