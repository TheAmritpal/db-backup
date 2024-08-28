import Elysia from "elysia";
import { getRemoteDatabase } from "@/server/database/controller";
import { checkDatabaseDto } from "@/server/database/dto/validateDatabase.dto";

export const databaseRoutes = new Elysia().group("/database", (app) =>
  app.post("/check", getRemoteDatabase, {
    body: checkDatabaseDto,
  })
);
