import { defineConfig } from "astro/config";
import bun from "astro-bun-adapter";

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  output: "server",
  adapter: bun(),
});
