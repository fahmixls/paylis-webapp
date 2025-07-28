CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"payer_address" varchar(42) NOT NULL,
	"recipient_address" varchar(42) NOT NULL,
	"token_address" varchar(42) NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"fee" numeric(78, 0) DEFAULT '0',
	"tx_hash" varchar(66) NOT NULL,
	"block_number" integer NOT NULL,
	"chain_id" integer NOT NULL,
	"status" varchar(32) NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	CONSTRAINT "transactions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE INDEX "idx_transactions_sender" ON "transactions" USING btree ("payer_address");--> statement-breakpoint
CREATE INDEX "idx_transactions_recipient" ON "transactions" USING btree ("recipient_address");--> statement-breakpoint
CREATE INDEX "idx_transactions_tx_hash" ON "transactions" USING btree ("tx_hash");