import { sql } from "drizzle-orm";
import { client, db } from "./index";
import { dealers, orders, products, trips, users } from "./schema";

/** Куда смотрим и что там лежит. Запускать с теми же переменными, что у Vercel. */
async function main() {
  const target = process.env.TURSO_DATABASE_URL?.trim() || `file:${process.env.DB_FILE?.trim() || "./data.db"}`;
  console.log(`База: ${target}`);
  console.log(target.startsWith("file:") ? "⚠ Это локальный файл. На Vercel он не переживёт деплой.\n" : "");

  try {
    const tables = await db.all<{ name: string }>(
      sql`select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name`,
    );
    if (tables.length === 0) {
      console.log("✗ Таблиц нет. Выполните: npx drizzle-kit push");
      return;
    }
    console.log(`Таблицы: ${tables.map((t) => t.name).join(", ")}\n`);

    const counts = await Promise.all([
      db.$count(users),
      db.$count(dealers),
      db.$count(products),
      db.$count(orders),
      db.$count(trips),
    ]);
    const [u, d, p, o, t] = counts;
    console.log(`Пользователей: ${u}`);
    console.log(`Дилеров:       ${d}`);
    console.log(`Номенклатуры:  ${p}`);
    console.log(`Заявок:        ${o}`);
    console.log(`Рейсов:        ${t}`);

    if (u === 0) console.log("\n✗ Войти некому. Выполните: npx tsx lib/db/seed.ts");
    else if (o === 0) console.log("\n⚠ Отчёты будут пустыми. Выполните: npx tsx lib/db/demo.ts");
    else console.log("\n✓ Данные на месте, входить можно.");
  } catch (e) {
    console.log(`✗ Не удалось прочитать базу: ${e instanceof Error ? e.message : e}`);
  } finally {
    client.close();
  }
}

main();
