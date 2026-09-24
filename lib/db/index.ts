import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Один драйвер на оба режима.
 * Локально и на заводском сервере это файл; на облачном стенде — Turso по сети.
 * Диалект тот же SQLite, поэтому схема и запросы не меняются.
 */

/*
 * MIZON_DB_* важнее TURSO_*.
 * Интеграция Turso в Vercel подставляет в TURSO_DATABASE_URL адрес ветки,
 * созданной под конкретный деплой: у неё свой снимок данных, и всё, что внесли
 * пользователи, остаётся в старой ветке после следующей выкладки.
 * Свои переменные интеграция не трогает, поэтому постоянную базу задаём через них.
 */
const tursoUrl = (process.env.MIZON_DB_URL || process.env.TURSO_DATABASE_URL)?.trim();
const tursoToken = (process.env.MIZON_DB_TOKEN || process.env.TURSO_AUTH_TOKEN)?.trim();

if (tursoToken && !tursoUrl) {
  throw new Error("Задан токен базы, но её адрес пуст. Впишите MIZON_DB_URL вида libsql://…turso.io");
}
if (tursoUrl && !tursoToken) {
  throw new Error("Задан адрес базы, но токен пуст. Создайте токен с правом Read & Write и впишите MIZON_DB_TOKEN.");
}
if (!tursoUrl && process.env.VERCEL) {
  throw new Error(
    "Нет подключения к базе: MIZON_DB_URL и TURSO_DATABASE_URL пусты. " +
      "Файловая база на Vercel не работает — её стирает каждый деплой.",
  );
}

const client = createClient({
  url: tursoUrl || `file:${process.env.DB_FILE?.trim() || "./data.db"}`,
  authToken: tursoToken,
});

export const db = drizzle(client, { schema });
export { schema, client };
