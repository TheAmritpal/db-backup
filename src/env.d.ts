/// <reference path="../.astro/types.d.ts" />

import type { Session } from "@/db/schema";

declare global {
  namespace App {
    interface Locals {
      session: Session | null;
      user: {
        id: number;
      } | null;
    }
  }
}
