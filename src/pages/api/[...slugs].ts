import { app } from "@/server/elysia.ts";
import type { APIContext } from "astro";

export const ALL = handle;

function handle({ request }: APIContext) {
  return app.handle(request);
}
