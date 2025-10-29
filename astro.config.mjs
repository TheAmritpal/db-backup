// @ts-check
import { defineConfig } from "astro/config";
import bun from "@nurodev/astro-bun";

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  output: "server",
  server: {
    port: Number(import.meta.env.PORT) || 4321,
    host: import.meta.env.HOST || "127.0.0.1",
    allowedHosts: ["dbbackup.amritpal.work", "localhost", "127.0.0.1"],
  },
});
