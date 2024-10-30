import Elysia, { t } from "elysia";
import * as schema from "@/db/schema";
import { _checkDatabase } from "./validation";
import { DatabaseConfig } from "@/db";
import { createConnection } from "mysql2/promise";
import type { DatabaseRow } from "./database.type";
import { and, eq } from "drizzle-orm";
import { authGuard } from "@/lib/authGuard";

export const databaseRoutes = new Elysia().group("/database", (app) =>
  app
    .decorate("db", new DatabaseConfig())
    .get("", async ({ db }) => {
      const databases = await db.drizzle.query.database.findMany();
      return databases;
    })
    .use(authGuard)
    .post(
      "/check",
      async ({ body, db, error }) => {
        try {
          const connection = await createConnection(body);
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
        } catch (err) {
          return error(500, {
            message: err,
          });
        }
      },
      {
        body: t.Omit(_checkDatabase, ["id", "database"]),
      }
    )
    .post(
      "/create",
      async ({ body, db, error }) => {
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
          return { success: true, message: ["Database Added"] };
        } catch (err) {
          return error(500, {
            message: err,
          });
        }
      },
      {
        body: t.Omit(_checkDatabase, ["id"]),
      }
    )
);
