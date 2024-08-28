import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const getDatabase = async (
  host: string,
  user: string
): Promise<schema.Database[]> => {
  try {
    return await db
      .select()
      .from(schema.database)
      .where(and(eq(schema.database.host, host), eq(schema.database.user, user)));
  } catch (error) {
    throw new Error("Error fetching Databases");
  }
};
