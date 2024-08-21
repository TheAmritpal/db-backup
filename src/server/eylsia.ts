import { Elysia } from "elysia";
import { authRoutes } from "@/server/routes/auth";
import { databaseRoutes } from "@/server/routes/database";

export const app = new Elysia({ prefix: "/api" }).use(authRoutes).use(databaseRoutes);

export type App = typeof app;
