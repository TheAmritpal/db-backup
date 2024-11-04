import { setting } from "@/db/schema/setting.schema";
import { createInsertSchema } from "drizzle-typebox";

export const _updateSettings = createInsertSchema(setting);
