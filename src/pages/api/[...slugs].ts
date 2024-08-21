import { app } from "@/server/eylsia";
import type { APIContext } from "astro";

export const ALL = handle;

function handle({ request }: APIContext) {
  return app.handle(request);
}
