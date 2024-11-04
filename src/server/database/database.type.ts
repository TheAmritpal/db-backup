import type { RowDataPacket } from "mysql2";
export interface Database {
  SCHEMA_NAME: string;
}

export interface DatabaseRow extends RowDataPacket, Database {}
