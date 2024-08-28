import Elysia, { t } from "elysia";
import { Logout, SignIn } from "@/server/auth/controller";

export const authRoutes = new Elysia().group("/auth", (app) =>
  app
    .post("/sign-in", SignIn, {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    })
    .post("/logout", Logout, {
      body: t.Object({
        sessionId: t.String(),
      }),
    })
);
