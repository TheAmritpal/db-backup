import Elysia, { t } from "elysia";
import * as schema from "@/db/schema";
import { DatabaseConfig } from "@/db";
import { lucia } from "../lucia";
import { eq } from "drizzle-orm";

export const authRoutes = new Elysia().group("/auth", (app) =>
  app
    .decorate("db", new DatabaseConfig())
    .post(
      "/sign-in",
      async ({ body, db, cookie, set }) => {
        try {
          const { email, password } = body;
          const user = await db.drizzle.query.user.findFirst({
            where: eq(schema.user.email, email),
          });
          if (!user) {
            set.status = 404;
            return { success: false, message: ["Email not found"] };
          }
          const isValid = await Bun.password.verify(password, user.password);
          if (!isValid) {
            set.status = 403;
            return { success: false, message: ["Incorrect Password"] };
          }
          const session = await lucia.createSession(user.id, {
            sessionId: user.id.toString(),
          });
          const sessionCookie = lucia.createSessionCookie(session.id);
          cookie[sessionCookie.name].set({
            value: sessionCookie.value,
            ...sessionCookie.attributes,
          });
          return { success: true, message: ["Login Success"] };
        } catch (err) {
          console.log(err);
          set.status = 500;
          return { success: false, message: [err instanceof Error ? err.message : "Internal server error"] };
        }
      },
      {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      }
    )
    .get("/logout", async ({ cookie: { auth_session }, redirect }) => {
      if (!auth_session?.value) {
        return redirect("http://localhost:4321/auth/sign-in");
      }

      await lucia.invalidateSession(auth_session.value);

      return redirect("http://localhost:4321/auth/sign-in");
    })
);
