import type { RowDataPacket } from "mysql2";
import * as schema from "@/db/schema";

export interface Database {
  SCHEMA_NAME: string;
}

export interface DatabaseRow extends RowDataPacket, Database {}
