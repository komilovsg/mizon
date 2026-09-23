import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

/**
 * Диагностика подключения к базе — отвечает изнутри самого хостинга.
 * Значений переменных не раскрывает: только видит их приложение или нет.
 */
export async function GET() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const token = process.env.TURSO_AUTH_TOKEN?.trim();

  const env = {
    // Адрес базы не секрет: без токена он бесполезен, а видеть его нужно,
    // чтобы не гадать, к какой именно базе подключён хостинг.
    TURSO_DATABASE_URL: url ? `${url} (${url.length} символов)` : "ПУСТО",
    TURSO_AUTH_TOKEN: token ? `задан, ${token.length} символов` : "ПУСТО",
    SESSION_SECRET: process.env.SESSION_SECRET?.trim() ? "задан" : "ПУСТО — сессии на значении по умолчанию",
    runtime: process.env.VERCEL ? "vercel" : "локально",
  };

  if (!url || !token) {
    return NextResponse.json(
      { ok: false, env, hint: "Впишите значения в Settings → Environment Variables и нажмите Redeploy." },
      { status: 503 },
    );
  }

  try {
    const client = createClient({ url, authToken: token });
    const tables = await client.execute(
      "select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name",
    );
    const names = tables.rows.map((r) => String(r.name));

    if (names.length === 0) {
      return NextResponse.json(
        { ok: false, env, tables: [], hint: "База пуста. Выполните локально: npx drizzle-kit push" },
        { status: 503 },
      );
    }

    const count = async (t: string) => Number((await client.execute(`select count(*) c from ${t}`)).rows[0].c);
    const counts = {
      users: await count("users"),
      dealers: await count("dealers"),
      orders: await count("orders"),
      trips: await count("trips"),
    };

    return NextResponse.json({
      ok: counts.users > 0,
      env,
      tables: names,
      counts,
      hint: counts.users > 0 ? "Всё на месте, входить можно." : "Нет пользователей. Выполните: npx tsx lib/db/seed.ts",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, env, error: e instanceof Error ? e.message.slice(0, 300) : String(e) },
      { status: 503 },
    );
  }
}
