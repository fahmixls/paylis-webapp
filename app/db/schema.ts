import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
  unique,
  text,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    address: varchar("address", { length: 42 }).notNull().unique(),
    nonce: varchar("nonce", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    addressIdx: index("idx_users_address").on(table.address),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionTokenIdx: index("idx_sessions_token").on(table.sessionToken),
    expiresAtIdx: index("idx_sessions_expires").on(table.expiresAt),
  })
);

export const merchants = pgTable(
  "merchants",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    description: text("description"),
    website: varchar("website", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 255 }),

    apiKey: varchar("api_key", { length: 255 }).notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_merchants_user_id").on(table.userId),
    uniqueUser: unique("uq_merchants_user_id").on(table.userId), // Enforce 1:1 relation
  })
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    transactionId: varchar("transaction_id", { length: 78 }),

    payerAddress: varchar("payer_address", { length: 42 }).notNull(),
    recipientAddress: varchar("recipient_address", { length: 42 }).notNull(),

    tokenAddress: varchar("token_address", { length: 42 }).notNull(),
    amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),

    txHash: varchar("tx_hash", { length: 66 }).unique(),
    blockNumber: integer("block_number"),
    chainId: integer("chain_id").notNull(),

    status: varchar("status", { length: 32 }).notNull(),
    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at"),
    orderId: varchar("order_id", { length: 78 }),
  },
  (table) => ({
    payerIdx: index("idx_transactions_sender").on(table.payerAddress),
    recipientIdx: index("idx_transactions_recipient").on(
      table.recipientAddress
    ),
    txHashIdx: index("idx_transactions_tx_hash").on(table.txHash),
  })
);

export const paymentIntents = pgTable("payment_intents", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 78 }),
  tokenAddress: varchar("token_address", { length: 42 }).notNull(),

  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
  fee: numeric("fee", { precision: 78, scale: 0 }).notNull(),
  total: numeric("total", { precision: 78, scale: 0 }).notNull(),

  merchantId: integer("merchant_id").references(() => merchants.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type NewPaymentIntent = typeof paymentIntents.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
