CREATE TABLE "payment_intents" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(78),
	"token_address" varchar(42) NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"fee" numeric(78, 0) NOT NULL,
	"total" numeric(78, 0) NOT NULL,
	"merchant_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "order_id" varchar(78);--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;