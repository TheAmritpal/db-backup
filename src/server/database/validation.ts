import { database } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

export const _checkDatabase = createInsertSchema(database, {
  id: t.Number({ error: "Id is required" }),
  host: t.String({
    error: "Host is required",
  }),
  user: t.String({ error: "User is required" }),
  password: t.String({ error: "Password is required" }),
  database: t.String({ error: "Database is required" }),
});
