import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
  unique,
  text,
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
  }),
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
  }),
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

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_merchants_user_id").on(table.userId),
    uniqueUser: unique("uq_merchants_user_id").on(table.userId), // Enforce 1:1 relation
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
