import { Lucia } from "lucia";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import * as schema from "@/db/schema";
import { DatabaseConfig } from "@/db";

const adapter = new DrizzleMySQLAdapter(
  new DatabaseConfig().drizzle,
  schema.session,
  schema.user
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: false,
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
  }
}
