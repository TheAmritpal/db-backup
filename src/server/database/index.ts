import Elysia, { t } from "elysia";
import * as schema from "@/db/schema";
import { _checkDatabase } from "./validation";
import { DatabaseConfig } from "@/db";
import { createConnection, type ConnectionOptions } from "mysql2/promise";
import type { DatabaseRow } from "./database.type";
import { and, eq } from "drizzle-orm";
import { authGuard } from "@/lib/authGuard";

export const databaseRoutes = new Elysia().group("/database", (app) =>
  app
    .decorate("db", new DatabaseConfig())
    .get("/", async ({ db }) => {
      const databases = await db.drizzle.query.database.findMany();
      return databases;
    })
    .get(
      "/download/:id",
      async ({ db, params, set }) => {
        try {
          const checkDatabase = await db.drizzle
            .select()
            .from(schema.database)
            .where(eq(schema.database.id, params.id));
          if (!checkDatabase.length) {
            set.headers["Location"] = "https://localhost:4321/database";
            set.status = 302;
            return "Redirecting...";
          }

          const dbUser = checkDatabase[0].user;
          const dbPassword = checkDatabase[0].password;
          const dbName = checkDatabase[0].database;

          const date = new Date();

          const outputFilePath = `./databases/${dbName}_backup_${date
            .toLocaleDateString()
            .replaceAll("/", "_")}.sql`;

          const command = ["/usr/bin/mysqldump", "-u", dbUser, `-p${dbPassword}`, dbName];

          const result = Bun.spawn(command, {
            stdout: Bun.file(outputFilePath),
          });

          await result.exited;

          if (result.exitCode !== 0) {
            console.error("Database dump failed");
            set.status = 500;
            return { success: false, message: "Database dump failed" };
          } else {
            console.log("Database dump successful!");
            
            // Read the generated file and return it
            const file = Bun.file(outputFilePath);
            const exists = await file.exists();
            
            if (!exists) {
              set.status = 500;
              return { success: false, message: "Backup file was not created" };
            }

            const fileContent = await file.arrayBuffer();
            const fileName = `${dbName}_backup_${date.toLocaleDateString().replaceAll("/", "_")}.sql`;
            
            set.headers["Content-Type"] = "application/sql";
            set.headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
            
            return new Response(fileContent);
          }
        } catch (err: any) {
          console.error("Error in database download:", err);
          set.status = 500;
          return { success: false, message: err.message || "Internal server error" };
        }
      },
      {
        params: t.Object({
          id: t.Number({ error: "Id is required" }),
        }),
      }
    )
    .use(authGuard)
    .post(
      "/delete",
      async ({ body, db, set }) => {
        const checkDatabase = await db.drizzle
          .select()
          .from(schema.database)
          .where(eq(schema.database.id, body.id));
        if (!checkDatabase.length) {
          set.status = 400;
          return {
            success: false,
            message: ["Database Not Found"],
          };
        }
        await db.drizzle.delete(schema.database).where(eq(schema.database.id, body.id));
        return { success: true, message: ["Database Deleted"] };
      },
      {
        body: t.Object({
          id: t.Number({ error: "Id is required" }),
        }),
      }
    )
    .post(
      "/change-backup",
      async ({ body, db, set }) => {
        try {
          console.log(body, "body");
          if (!body.id) {
            set.status = 400;
            return {
              success: false,
              message: ["Id is required"],
            };
          }
          const checkDatabase = await db.drizzle
            .select()
            .from(schema.database)
            .where(eq(schema.database.id, body.id));
          if (!checkDatabase.length) {
            set.status = 400;
            return {
              success: false,
              message: ["Database not found"],
            };
          }
          await db.drizzle
            .update(schema.database)
            .set({ backup: body.backup })
            .where(eq(schema.database.id, body.id));
          return { success: true, message: ["Backup Updated"] };
        } catch (err: any) {
          set.status = 500;
          return {
            message: err.message || "Internal server error",
          };
        }
      },
      {
        body: t.Omit(_checkDatabase, ["host", "user", "password", "database"]),
      }
    )
    .post(
      "/check",
      async ({ body, db, set }) => {
        try {
          const connectionData = {
            host: body.host,
            user: body.user,
            password: body.password,
          } as ConnectionOptions;
          const connection = await createConnection(connectionData);
          const [rows] = await connection.query<DatabaseRow[]>({
            sql: `SELECT SCHEMA_NAME FROM 
              INFORMATION_SCHEMA.SCHEMATA WHERE 
              SCHEMA_NAME NOT IN 
              ('information_schema', 'mysql', 'performance_schema', 'sys')
          `,
          });
          const databases = await db.drizzle
            .select()
            .from(schema.database)
            .where(
              and(
                eq(schema.database.host, body.host),
                eq(schema.database.user, body.user)
              )
            );
          let response: any = [];
          for (const row of rows) {
            const findDatabase = databases.find((db) => db.database === row.SCHEMA_NAME);
            if (!findDatabase) {
              response.push(row);
            }
          }
          return response;
        } catch (err: any) {
          set.status = 500;
          return {
            message: [err.message],
          };
        }
      },
      {
        body: t.Omit(_checkDatabase, ["id", "database", "backup"]),
      }
    )
    .post(
      "/create",
      async ({ body, db, set }) => {
        try {
          const checkDatabaseExists = await db.drizzle
            .select()
            .from(schema.database)
            .where(
              and(
                eq(schema.database.host, body.host),
                eq(schema.database.user, body.user),
                eq(schema.database.password, body.password),
                eq(schema.database.database, body.database)
              )
            );
          if (!checkDatabaseExists.length)
            await db.drizzle.insert(schema.database).values(body);
          return new Response(
            JSON.stringify({ success: true, message: ["Database Added"] }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          set.status = 500;
          return {
            message: err.message || "Internal server error",
          };
        }
      },
      {
        body: t.Omit(_checkDatabase, ["id", "backup"]),
      }
    )
);
