import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Один драйвер на оба режима.
 * Локально и на заводском сервере это файл; на облачном стенде — Turso по сети.
 * Диалект тот же SQLite, поэтому схема и запросы не меняются.
 */
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? `file:${process.env.DB_FILE ?? "./data.db"}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema, client };
