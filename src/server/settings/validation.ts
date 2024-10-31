import { setting } from "@/db/schema/setting.schema";
import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

export const _updateSettings = createInsertSchema(setting);
