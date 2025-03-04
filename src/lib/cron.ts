import { DatabaseConfig } from "@/db";
import * as schema from "@/db/schema";
import { EBackup } from "@/db/utils/EBackup.enum";
import {
  DRIVE_FOLDER_ID,
  DRIVE_FOLDER_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
} from "@/server/settings/setting.constant";
import { eq, inArray } from "drizzle-orm";
import { GoogleOAuth } from "./googleDrive";
import { generateMySQLDump } from "./mysqlDump";

export default async function dbCron() {
  try {
    const db = new DatabaseConfig();
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
            GOOGLE_REFRESH_TOKEN,
            DRIVE_FOLDER_ID,
          ])
        ),
    ]);
    const settingMap = Object.fromEntries(settings.map((s) => [s.name, s.value]));
    const {
      google_client_id,
      google_client_secret,
      google_redirect_uri,
      google_refresh_token,
      db_backups,
    } = settingMap;
    if (
      !google_client_id ||
      !google_client_secret ||
      !google_redirect_uri ||
      !google_refresh_token
    ) {
      console.error("Missing Google API credentials.");
      return { success: false, message: "Missing credentials" };
    }
    const googleOAuth = new GoogleOAuth(
      google_client_id,
      google_client_secret,
      google_redirect_uri,
      google_refresh_token
    );

    let parent_id: string;

    if (!db_backups) {
      const exists = await googleOAuth.checkFolderByName(DRIVE_FOLDER_NAME);
      if (exists) {
        parent_id = exists;
        await db.drizzle
          .update(schema.setting)
          .set({
            value: exists,
          })
          .where(eq(schema.setting.name, DRIVE_FOLDER_ID));
      } else {
        const folderId = await googleOAuth.createFolder(DRIVE_FOLDER_NAME);
        parent_id = folderId;
        await db.drizzle.insert(schema.setting).values({
          name: DRIVE_FOLDER_ID,
          value: folderId,
          description: "Backup Folder ID",
        });
      }
    } else {
      parent_id = db_backups;
    }
    for await (const database of databases) {
      const today = new Date().toISOString().split("T")[0];
      const fileName = `${today}.sql`;

      if(database.lastBackupDate?.toISOString().split("T")[0] === today) continue

      const connInfo = {
        user: database.user,
        password: database.password,
        database: database.database,
        host: database.host,
      } as { user: string; password: string; database: string; host: string };

      const dumpStatus = await generateMySQLDump(
        connInfo
        //filePath
      );

      if (typeof dumpStatus === "boolean" && !dumpStatus) continue;

      const dump = dumpStatus as ReadableStream;
      let folderId =
        database.folderId ||
        (await googleOAuth.checkFolderByName(database.database, parent_id));
      if (!folderId) {
        folderId = await googleOAuth.createFolder(database.database, parent_id);
      }

      await googleOAuth.deleteOldestFile(folderId, 7);

      await googleOAuth.uploadFile(folderId, fileName, dump);
      await db.drizzle
        .update(schema.database)
        .set({ folderId, lastBackupDate: new Date() })
        .where(eq(schema.database.id, database.id));
    }

    return { success: true };
  } catch (err) {
    console.log(err);
  }
}
