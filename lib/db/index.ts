import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Один драйвер на оба режима.
 * Локально и на заводском сервере это файл; на облачном стенде — Turso по сети.
 * Диалект тот же SQLite, поэтому схема и запросы не меняются.
 */

// Пустая строка — это не «не задано», а «задано неправильно»: переменную в панели
// хостинга создали, а значение вставить забыли. Без trim такой случай уходит
// вглубь драйвера и всплывает невнятным URL_INVALID уже на первом запросе.
const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (tursoToken && !tursoUrl) {
  throw new Error("Задан TURSO_AUTH_TOKEN, но TURSO_DATABASE_URL пуст. Впишите адрес базы вида libsql://…turso.io");
}
if (tursoUrl && !tursoToken) {
  throw new Error("Задан TURSO_DATABASE_URL, но TURSO_AUTH_TOKEN пуст. Создайте токен с правом Read & Write.");
}
if (!tursoUrl && process.env.VERCEL) {
  throw new Error(
    "Нет подключения к Turso: TURSO_DATABASE_URL и TURSO_AUTH_TOKEN пусты. " +
      "Файловая база на Vercel не работает — её стирает каждый деплой.",
  );
}

const client = createClient({
  url: tursoUrl || `file:${process.env.DB_FILE?.trim() || "./data.db"}`,
  authToken: tursoToken,
});

export const db = drizzle(client, { schema });
export { schema, client };
