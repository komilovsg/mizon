import { inArray, like } from "drizzle-orm";
import { client, db } from "./index";
import { dealers, orders, products, trips } from "./schema";

// tsx запускает файл как CommonJS, поэтому await живёт внутри функции.
async function main() {

  /** Наполняет базу историей отгрузок, чтобы отчёты и график было на чём смотреть. */
  const PREFIX = "DEMO-";

  const old = await db.select({ id: orders.id }).from(orders).where(like(orders.number, `${PREFIX}%`));
  if (old.length > 0) {
    const ids = old.map((o) => o.id);
    await db.delete(trips).where(inArray(trips.orderId, ids));
    await db.delete(orders).where(inArray(orders.id, ids));
  }

  const allDealers = (await db.select().from(dealers)).filter((d) => d.status === "active");
  const allProducts = await db.select().from(products);
  if (allDealers.length === 0 || allProducts.length === 0) throw new Error("Сначала pnpm db:seed");

  const PLATES = ["2701AB01", "5512KM02", "8834TJ01", "1290BC02", "4455KH03", "7761AA01", "3302MM02"];
  const DRIVERS = [
    "Раҳимов Абдулло Саидович",
    "Сафаров Диловар Нурович",
    "Ҷӯраев Фирӯз Маҳмадович",
    "Каримов Нозим Раҷабович",
    "Холов Сухроб Асламович",
  ];
  const PLACES = [
    "Рӯдакӣ, склад «Сомон»",
    "Бохтар, трасса М41, 12 км",
    "Душанбе, ул. Айнӣ 145",
    "Ҳисор, стройплощадка «Нур»",
    "Турсунзода, завод ЖБИ",
  ];

  const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const between = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const stamp = (d: Date) =>
    `${String(d.getFullYear() % 100)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  let made = 0;
  for (let ago = 29; ago >= 0; ago--) {
    // Воскресенье завод не грузит, и график должен это показывать.
    const day = new Date();
    day.setDate(day.getDate() - ago);
    if (day.getDay() === 0) continue;

    for (let n = 0; n < between(1, 4); n++) {
      const product = pick(allProducts);
      const dealer = pick(allDealers);
      const tons = pick([10, 15, 20, 30, 40]);

      const created = new Date(day);
      created.setHours(between(8, 11), between(0, 59), 0, 0);
      const createdAt = Math.floor(created.getTime() / 1000);

      const [order] = await db
        .insert(orders)
        .values({
          number: `${PREFIX}${stamp(created)}-${String(900 + made).padStart(3, "0")}`,
          dealerId: dealer.id,
          createdBy: 1,
          createdAt,
          productId: product.id,
          product: product.name,
          tons,
          destination: pick(PLACES),
          status: "approved",
          decidedBy: 1,
          decidedAt: createdAt,
          channel: Math.random() > 0.5 ? "web" : "phone",
        })
        .returning();

      for (let k = 0; k < Math.ceil(tons / 15); k++) {
        const arrived = createdAt + between(3600, 4 * 3600);
        const loaded = arrived + between(1200, 3600);
        const tareKg = between(11000, 14000);
        const netKg = between(11000, 15000);

        await db.insert(trips).values({
          orderId: order.id,
          plate: pick(PLATES),
          driverName: pick(DRIVERS),
          status: "departed",
          arrivedAt: arrived,
          loadedAt: loaded,
          departedAt: loaded + between(600, 1800),
          tareKg,
          grossKg: tareKg + netKg,
          netKg,
          waybillNo: `НК-${String(100000 + made * 10 + k)}`,
          createdAt: arrived,
        });
      }
      made++;
    }
  }

  // Сегодняшний день оставляем незакрытым, иначе доска пустая и её не на чем показать.
  const today = new Date();
  today.setHours(7, 0, 0, 0);
  const todayAt = Math.floor(today.getTime() / 1000);
  const liveProduct = pick(allProducts);

  const [live] = await db
    .insert(orders)
    .values({
      number: `${PREFIX}${stamp(today)}-950`,
      dealerId: pick(allDealers).id,
      createdBy: 1,
      createdAt: todayAt,
      productId: liveProduct.id,
      product: liveProduct.name,
      tons: 60,
      destination: pick(PLACES),
      status: "approved",
      decidedBy: 1,
      decidedAt: todayAt,
    })
    .returning();

  const plan = [
    { status: "expected" as const, n: 3 },
    { status: "on_site" as const, n: 2 },
    { status: "loaded" as const, n: 2 },
  ];

  let p = 0;
  for (const { status, n } of plan) {
    for (let i = 0; i < n; i++) {
      const arrived = status === "expected" ? null : todayAt + between(3600, 3 * 3600);
      const tareKg = between(11000, 14000);
      const netKg = between(11000, 15000);
      await db.insert(trips).values({
        orderId: live.id,
        plate: PLATES[p % PLATES.length],
        driverName: DRIVERS[p % DRIVERS.length],
        status,
        arrivedAt: arrived,
        loadedAt: status === "loaded" ? (arrived ?? todayAt) + 1800 : null,
        tareKg: status === "loaded" ? tareKg : null,
        grossKg: status === "loaded" ? tareKg + netKg : null,
        netKg: status === "loaded" ? netKg : null,
        waybillNo: status === "loaded" ? `НК-${String(200000 + p)}` : null,
        createdAt: todayAt,
      });
      p++;
    }
  }

  console.log(`demo: ${made} заявок за 30 дней + ${p} машин на сегодня`);
  client.close();

}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
