import { Elysia } from "elysia";
import { authRoutes } from "@/server/auth/route";
import { databaseRoutes } from "@/server/database/route";

export const app = new Elysia({ prefix: "/api" }).use(authRoutes).use(databaseRoutes);

export type App = typeof app;
