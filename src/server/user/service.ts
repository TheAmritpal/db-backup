import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (email: string) => {
  return await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });
};
