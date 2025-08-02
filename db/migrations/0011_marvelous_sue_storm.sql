ALTER TABLE "merchants" ADD COLUMN "api_key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_api_key_unique" UNIQUE("api_key");