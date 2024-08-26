import { datetime, int, mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: datetime("created_at", { mode: "date" }).default(new Date()).notNull(),
  updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()).notNull(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
