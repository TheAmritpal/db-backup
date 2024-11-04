import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  verbose: true,
} satisfies Config);
