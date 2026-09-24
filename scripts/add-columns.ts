import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL?.trim() || `file:${process.env.DB_FILE?.trim() || "./data.db"}`;
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN?.trim() });
  console.log("база:", url.slice(0, 45));

  for (const [table, col, type] of [
    ["orders", "contact_name", "text"],
    ["trips", "truck_model", "text"],
  ]) {
    const info = await client.execute(`PRAGMA table_info(${table})`);
    const has = info.rows.some((r) => String(r.name) === col);
    if (has) {
      console.log(`  ${table}.${col} — уже есть`);
    } else {
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      console.log(`  ${table}.${col} — добавлена`);
    }
  }
  client.close();
}
main();
