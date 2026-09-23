import { db, client } from "./index";
import { dealers, products, users } from "./schema";

// tsx запускает файл как CommonJS, поэтому await живёт внутри функции.
async function main() {

  const seedDealers = [
    { name: 'ООО "Сомон Строй"', inn: "030012345", phone: "+992900000002", code1c: "K-000142", status: "active" as const },
    { name: 'ЧП "Рӯдакӣ Бетон"', inn: "030054321", phone: "+992900000012", code1c: "K-000143", status: "active" as const },
    { name: "Ҷӯраев Фирӯз Саидович", inn: "030099887", phone: "+992900000022", code1c: "K-000144", status: "active" as const },
  ];

  const d = await db.insert(dealers).values(seedDealers).returning();

  await db.insert(users).values([
    { name: "Диспетчер Назаров", phone: "+992900000001", pin: "1111", role: "dispatcher" as const },
    { name: "Саидов Ҷамшед", phone: "+992900000002", pin: "1111", role: "dealer" as const, dealerId: d[0].id },
    { name: "Охрана КПП-1", phone: "+992900000003", pin: "1111", role: "gate" as const },
    { name: "Весовщик Каримов", phone: "+992900000004", pin: "1111", role: "scale" as const },
    { name: "Админ", phone: "+992900000000", pin: "1111", role: "admin" as const },
  ]);

  // Замените на номенклатуру своего предприятия.
  await db.insert(products).values([
    { name: "Цемент М400", code1c: "N-0001", sortOrder: 10 },
    { name: "Цемент М500", code1c: "N-0002", sortOrder: 20 },
    { name: "Щебень фр. 5-20", code1c: "N-0010", sortOrder: 30 },
    { name: "Песок строительный", code1c: "N-0011", sortOrder: 40 },
    { name: "Известь", code1c: "N-0020", sortOrder: 50 },
  ]);

  console.log("seed: ok");
  client.close();

}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
