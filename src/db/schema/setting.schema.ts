import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const setting = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  value: varchar("value", { length: 255 }),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Setting = typeof setting.$inferSelect;
export type NewSetting = typeof setting.$inferInsert;
