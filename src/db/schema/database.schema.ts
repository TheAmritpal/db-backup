import { datetime, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const database = mysqlTable("databases", {
  id: int("id").autoincrement().primaryKey(),
  host: varchar("host", { length: 255 }).notNull(),
  user: varchar("user", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  database: varchar("database", { length: 255 }).notNull(),
  createdAt: datetime("created_at", { mode: "date" }).default(new Date()).notNull(),
  updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()).notNull(),
});

export type Database = typeof database.$inferSelect;
export type NewDatabase = typeof database.$inferInsert;
