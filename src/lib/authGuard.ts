import { lucia } from "@/server/lucia";
import Elysia, { t } from "elysia";
import { type User, verifyRequestOrigin } from "lucia";

const sessionCookieName = lucia.sessionCookieName;

const authGuard = new Elysia({
  name: "authGuard",
})
  .guard({
    cookie: t.Object({
      [sessionCookieName]: t.Optional(t.String()),
    }),
    headers: t.Object({
      origin: t.Optional(t.String()),
      host: t.Optional(t.String()),
      authorization: t.Optional(t.String()),
    }),
  })
  .resolve(
    { as: "scoped" },
    async ({
      cookie,
      headers: { origin, host, authorization },
      request: { method },
    }): Promise<{ user: User }> => {
      const sessionCookie = cookie[sessionCookieName];
      const sessionId: string | null | undefined =
        lucia.readBearerToken(authorization ?? "") ?? sessionCookie?.value;

      if (
        !authorization &&
        method !== "GET" &&
        (!origin ||
          !host ||
          !verifyRequestOrigin(origin, ["http://localhost:4321", "localhost:4321"]))
      ) {
        throw new Error("Invalid origin");
      }

      if (!sessionId) {
        throw new Error("UnAuthorized");
      }

      const { session, user } = await lucia.validateSession(sessionId);

      if (!session) {
        const newSessionCookie = lucia.createBlankSessionCookie();
        sessionCookie?.set({
          value: newSessionCookie.value,
          ...newSessionCookie.attributes,
        });
        throw new Error("UnAuthorized");
      }

      if (session?.fresh) {
        const newSessionCookie = lucia.createSessionCookie(sessionId);
        sessionCookie?.set({
          value: newSessionCookie.value,
          ...newSessionCookie.attributes,
        });
      }

      return { user };
    }
  );

export { authGuard };
