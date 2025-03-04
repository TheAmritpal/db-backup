import { datetime, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { EBackup } from "@/db/utils/EBackup.enum";

export const database = mysqlTable("databases", {
  id: int("id").autoincrement().primaryKey(),
  host: varchar("host", { length: 255 }).notNull(),
  user: varchar("user", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  database: varchar("database", { length: 255 }).notNull(),
  folderId: varchar("folder_id", { length: 255 }),
  lastBackupDate: datetime("last_backup_date", { mode: "date" }),
  backup: mysqlEnum("backup", [EBackup.DAILY, EBackup.WEEKLY]).default(EBackup.DAILY),
  createdAt: datetime("created_at", { mode: "date" }).default(new Date()).notNull(),
  updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()).notNull(),
});

export type Database = typeof database.$inferSelect;
export type NewDatabase = typeof database.$inferInsert;
