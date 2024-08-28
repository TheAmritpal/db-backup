import { t } from "elysia";

export const checkDatabaseDto = t.Object({
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
});
