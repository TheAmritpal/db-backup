import {
  drizzle,
  type MySql2Database,
  type MySql2DrizzleConfig,
} from "drizzle-orm/mysql2";
import { createPool, type PoolOptions } from "mysql2/promise";
import * as schema from "@/db/schema";

const pool = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
} satisfies PoolOptions);

export const db: MySql2Database<typeof schema> = drizzle(pool, {
  schema,
  mode: "default",
} as MySql2DrizzleConfig<typeof schema>);
