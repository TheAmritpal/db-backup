// @ts-check
import { defineConfig } from "astro/config";
import bun from "@nurodev/astro-bun";

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  output: "server",
});
