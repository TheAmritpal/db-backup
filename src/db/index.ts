import {
  drizzle,
  type MySql2Database,
  type MySql2DrizzleConfig,
} from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "@/db/schema";

if (!import.meta.env.MYSQL_URL) throw new Error("MYSQL CONNECTION STRING IS REQUIRED");

const pool = createPool(import.meta.env.MYSQL_URL);
export class DatabaseConfig {
  db: MySql2Database<typeof schema>;
  constructor() {
    this.db = drizzle(pool, {
      schema,
      mode: "default",
    } as MySql2DrizzleConfig<typeof schema>);
  }

  get drizzle(): MySql2Database<typeof schema> {
    return this.db;
  }
}
