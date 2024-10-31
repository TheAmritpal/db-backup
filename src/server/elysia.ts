import { Elysia } from "elysia";
import { authRoutes } from "@/server/auth";
import { databaseRoutes } from "@/server/database";
import { settingRoutes } from "@/server/settings";

export const app = new Elysia({ prefix: "/api" })
  .onError(({ error, code }) => {
    console.log(JSON.stringify(error, null, 2));
    if (code === "VALIDATION") {
      const messages = [];
      for (const element of error.all) {
        if (element.summary) {
          messages.push(element.schema.error);
        } else {
          messages.push("No summary available for this error.");
        }
      }
      return { success: false, message: messages };
    } else {
      console.log(JSON.stringify(error.message, null, 2), "error.message");
      return { success: false, message: [error.message] };
    }
  })
  .use(authRoutes)
  .use(databaseRoutes)
  .use(settingRoutes);

export type App = typeof app;
