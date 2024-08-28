import type { Context } from "elysia";
import { createConnection, type ConnectionOptions } from "mysql2/promise";
import { checkDatabaseDto } from "@/server/database/dto/validateDatabase.dto";
import { getDatabase } from "./service";
import type { DatabaseRow } from "./database.type";

export const getRemoteDatabase = async (context: Context) => {
  try {
    const body = context.body as typeof checkDatabaseDto;
    const connection = await createConnection(body as ConnectionOptions);
    const [rows] = await connection.query<DatabaseRow[]>({
      sql: `SELECT SCHEMA_NAME FROM 
        INFORMATION_SCHEMA.SCHEMATA WHERE 
        SCHEMA_NAME NOT IN 
        ('information_schema', 'mysql', 'performance_schema', 'sys')
    `,
    });
    const databases = await getDatabase(body.host, body.user);
    let response: any = [];
    for (const row of rows) {
      const findDatabase = databases.find((db) => db.database === row.SCHEMA_NAME);
      if (!findDatabase) {
        response.push(row);
      }
    }
    return response;
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
