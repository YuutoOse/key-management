import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const borrowingStatusEnum = pgEnum("borrowing_status", [
  "borrowed",
  "pending_confirm",
  "completed",
]);

export const keys = pgTable("keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const borrowings = pgTable(
  "borrowings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    keyId: text("key_id")
      .notNull()
      .references(() => keys.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    borrowedAt: timestamp("borrowed_at").notNull(),
    returnedAt: timestamp("returned_at"),
    confirmedAt: timestamp("confirmed_at"),
    confirmedBy: text("confirmed_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    autoConfirmed: boolean("auto_confirmed").default(false),
    reason: text("reason").notNull(),
    status: borrowingStatusEnum("status").notNull().default("borrowed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_active_borrowing_per_key")
      .on(table.keyId)
      .where(sql`${table.status} = 'borrowed'`),
  ],
);
