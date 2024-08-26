import { int, datetime, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { user } from "./user.schema";

export const session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: datetime("expires_at").notNull(),
});

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
