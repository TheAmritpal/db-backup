import Elysia, { t } from "elysia";
import { addDatabase } from "@/server/services/database";

export const databaseRoutes = new Elysia().group("/database", (app) =>
  app.post("", addDatabase, {
    body: t.Object({
      host: t.String({
        error: {
          message: "Host is required",
        },
      }),
      user: t.String({
        error: {
          message: "User is required",
        },
      }),
      password: t.String({
        error: {
          message: "Password is required",
        },
      }),
    }),
  })
);
