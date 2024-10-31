import Elysia, { t } from "elysia";
import * as schema from "@/db/schema";
import { DatabaseConfig } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { authGuard } from "@/lib/authGuard";
import { _updateSettings } from "@/server/settings/validation";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "./setting.constant";
import cron, { Patterns } from "@elysiajs/cron";
import { EBackup } from "@/db/utils/EBackup.enum";

export const settingRoutes = new Elysia().group("/setting", (app) => {
  const db = new DatabaseConfig();
  return app
    .decorate("db", db)
    .use(
      cron({
        name: EBackup.DAILY,
        pattern: Patterns.daily(),
        async run() {
          const databases = await db.drizzle
            .select()
            .from(schema.database)
            .where(eq(schema.database.backup, EBackup.DAILY));
        },
      })
    )
    .get("/", async ({ db }) => {
      const settings = await db.drizzle
        .select()
        .from(schema.setting)
        .where(
          inArray(schema.setting.name, [
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI,
          ])
        );
      return settings;
    })
    .use(authGuard)
    .post(
      "/",
      async ({ body, db }) => {
        const names = body.map(({ name }) => name);
        let i = 0;
        for await (const name of names) {
          const exists = await db.drizzle
            .select()
            .from(schema.setting)
            .where(eq(schema.setting.name, name));
          if (exists.length) {
            await db.drizzle
              .update(schema.setting)
              .set({ value: body[i].value })
              .where(eq(schema.setting.id, exists[0].id));
          } else {
            await db.drizzle.insert(schema.setting).values(body[i]);
          }
          i++;
        }
        return { success: true, message: ["Settings Updated"] };
      },
      {
        body: t.Array(
          t.Object({
            name: t.String({ error: "Name is required" }),
            value: t.String({ error: "Value is required" }),
            description: t.String({ error: "Description is required" }),
          })
        ),
      }
    );
});
