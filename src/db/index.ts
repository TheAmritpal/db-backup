import {
  drizzle,
  type MySql2Database,
  type MySql2DrizzleConfig,
} from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "@/db/schema";

if (!import.meta.env.MYSQL_URL) throw new Error("MYSQL CONNECTION STRING IS REQUIRED");

export class DatabaseConfig {
  db: MySql2Database<typeof schema>;
  pool: Pool;
  constructor() {
    this.pool = createPool(import.meta.env.MYSQL_URL);
    this.db = drizzle(this.pool, {
      schema,
      mode: "default",
    } as MySql2DrizzleConfig<typeof schema>);
  }

  get drizzle(): MySql2Database<typeof schema> {
    return this.db;
  }
}
