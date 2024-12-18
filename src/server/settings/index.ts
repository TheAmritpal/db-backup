import Elysia, { t } from "elysia";
import * as schema from "@/db/schema";
import { DatabaseConfig } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { authGuard } from "@/lib/authGuard";
import { _updateSettings } from "@/server/settings/validation";
import {
  DRIVE_FOLDER_ID,
  DRIVE_FOLDER_NAME,
  GOOGLE_ACCESS_TOKEN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
} from "@/server/settings/setting.constant";
import cron, { Patterns } from "@elysiajs/cron";
import { EBackup } from "@/db/utils/EBackup.enum";
import { GoogleOAuth } from "@/lib/googleDrive";

export const settingRoutes = new Elysia().group("/setting", (app) => {
  const db = new DatabaseConfig();
  return app
    .decorate("db", db)
    .use(
      cron({
        name: EBackup.DAILY,
        pattern: Patterns.daily(),
        async run() {
          try {
            const [databases, settings] = await Promise.all([
              db.drizzle
                .select()
                .from(schema.database)
                .where(eq(schema.database.backup, EBackup.DAILY)),
              db.drizzle
                .select()
                .from(schema.setting)
                .where(
                  inArray(schema.setting.name, [
                    GOOGLE_CLIENT_ID,
                    GOOGLE_CLIENT_SECRET,
                    GOOGLE_REDIRECT_URI,
                    GOOGLE_ACCESS_TOKEN,
                  ])
                ),
            ]);
            console.log(databases, settings);
          } catch (err) {
            console.log(err);
          }
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
            GOOGLE_ACCESS_TOKEN,
          ])
        );
      return settings;
    })
    .get("/code", async ({ query, db, redirect }) => {
      if (!query?.code) return redirect("http://localhost:4321/settings");
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
      const checkToken = await db.drizzle
        .select()
        .from(schema.setting)
        .where(eq(schema.setting.name, GOOGLE_ACCESS_TOKEN));
      if (checkToken.length)
        await db.drizzle
          .update(schema.setting)
          .set({ value: query.code })
          .where(eq(schema.setting.name, GOOGLE_ACCESS_TOKEN));
      else
        await db.drizzle.insert(schema.setting).values({
          name: GOOGLE_ACCESS_TOKEN,
          value: query.code,
          description: GOOGLE_ACCESS_TOKEN,
        });

      let google_client_id: string = "";
      let google_client_secret: string = "";
      let google_redirect_uri: string = "";
      let google_access_token: string = query.code;
      for await (const setting of settings) {
        if (setting.name === GOOGLE_CLIENT_ID && setting.value)
          google_client_id = setting.value;
        if (setting.name === GOOGLE_CLIENT_SECRET && setting.value)
          google_client_secret = setting.value;
        if (setting.name === GOOGLE_REDIRECT_URI && setting.value)
          google_redirect_uri = setting.value;
      }
      if (!google_client_id || !google_client_secret || !google_redirect_uri) return;
      const googleOAuth = new GoogleOAuth(
        google_client_id,
        google_client_secret,
        google_redirect_uri
      );

      const tokens = await googleOAuth.init(google_access_token);

      const checkRefreshToken = await db.drizzle
        .select()
        .from(schema.setting)
        .where(eq(schema.setting.name, GOOGLE_REFRESH_TOKEN));
      if (checkRefreshToken.length)
        await db.drizzle
          .update(schema.setting)
          .set({ value: tokens.refresh_token })
          .where(eq(schema.setting.name, GOOGLE_REFRESH_TOKEN));
      else
        await db.drizzle.insert(schema.setting).values({
          name: GOOGLE_REFRESH_TOKEN,
          value: tokens.refresh_token,
          description: "Google Refresh Token",
        });

      return redirect("http://localhost:4321/settings");
    })
    .get("/check", async ({ db }) => {
      try {
        const settings = await db.drizzle
          .select()
          .from(schema.setting)
          .where(
            inArray(schema.setting.name, [
              GOOGLE_CLIENT_ID,
              GOOGLE_CLIENT_SECRET,
              GOOGLE_REDIRECT_URI,
              GOOGLE_REFRESH_TOKEN,
              DRIVE_FOLDER_ID,
            ])
          );
        let google_client_id: string = "";
        let google_client_secret: string = "";
        let google_redirect_uri: string = "";
        let google_refresh_token: string = "";
        let drive_folder_id: string = "";
        for await (const setting of settings) {
          if (setting.name === GOOGLE_CLIENT_ID && setting.value)
            google_client_id = setting.value;
          if (setting.name === GOOGLE_CLIENT_SECRET && setting.value)
            google_client_secret = setting.value;
          if (setting.name === GOOGLE_REDIRECT_URI && setting.value)
            google_redirect_uri = setting.value;
          if (setting.name === GOOGLE_REFRESH_TOKEN && setting.value)
            google_refresh_token = setting.value;
          if (setting.name === DRIVE_FOLDER_ID && setting.value)
            drive_folder_id = setting.value;
        }
        if (
          !google_client_id ||
          !google_client_secret ||
          !google_redirect_uri ||
          !google_refresh_token
        )
          return;
        const googleOAuth = new GoogleOAuth(
          google_client_id,
          google_client_secret,
          google_redirect_uri,
          google_refresh_token
        );
        let folderId = await googleOAuth.checkFolderByName(DRIVE_FOLDER_NAME);
        if (!folderId) {
          folderId = await googleOAuth.createFolder(DRIVE_FOLDER_NAME);
        }
        // await googleOAuth.uploadDatabase(folderId);
        return { success: true };
      } catch (error) {
        return { success: false, message: [error] };
      }
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
    )
    .post("/remove-access", async ({ db }) => {
      await db.drizzle
        .update(schema.setting)
        .set({ value: "" })
        .where(eq(schema.setting.name, GOOGLE_ACCESS_TOKEN));
      return { success: true, message: ["Access Removed"] };
    });
});
