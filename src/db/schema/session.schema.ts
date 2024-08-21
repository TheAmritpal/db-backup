import { datetime, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import * as schema from "@/db/schema";

export const session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => schema.admin.id),
  expiresAt: datetime("expires_at").notNull(),
});

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
