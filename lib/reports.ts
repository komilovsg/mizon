import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "./db";

export const PERIODS = [1, 7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

/** Границы периода: с полуночи N-1 дней назад до конца сегодняшнего дня. */
export function range(days: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { from: Math.floor(start.getTime() / 1000), to: Math.floor(end.getTime() / 1000), start, end };
}

const departedIn = (from: number, to: number) =>
  and(eq(schema.trips.status, "departed"), gte(schema.trips.departedAt, from), lte(schema.trips.departedAt, to));

export async function totals(from: number, to: number) {
  const [out] = await db
    .select({
      netKg: sql<number>`coalesce(sum(${schema.trips.netKg}), 0)`,
      trucks: sql<number>`count(*)`,
    })
    .from(schema.trips)
    .where(departedIn(from, to));

  const [arrived] = await db
    .select({ trucks: sql<number>`count(*)` })
    .from(schema.trips)
    .where(and(gte(schema.trips.arrivedAt, from), lte(schema.trips.arrivedAt, to)));

  const [orders] = await db
    .select({
      count: sql<number>`count(*)`,
      tons: sql<number>`coalesce(sum(${schema.orders.tons}), 0)`,
    })
    .from(schema.orders)
    .where(and(gte(schema.orders.createdAt, from), lte(schema.orders.createdAt, to)));

  return {
    shippedKg: out.netKg,
    departed: out.trucks,
    arrived: arrived.trucks,
    orders: orders.count,
    orderedTons: orders.tons,
    avgKg: out.trucks > 0 ? Math.round(out.netKg / out.trucks) : 0,
  };
}

/** Тонны по дням. Дни без отгрузки возвращаются нулями, иначе график врёт о ритме работы. */
export async function byDay(from: number, to: number, start: Date, days: number) {
  const rows = await db
    .select({
      day: sql<string>`date(${schema.trips.departedAt}, 'unixepoch', 'localtime')`,
      netKg: sql<number>`coalesce(sum(${schema.trips.netKg}), 0)`,
      trucks: sql<number>`count(*)`,
    })
    .from(schema.trips)
    .where(departedIn(from, to))
    .groupBy(sql`1`);

  const found = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hit = found.get(key);
    return { date: d, netKg: hit?.netKg ?? 0, trucks: hit?.trucks ?? 0 };
  });
}

export async function byProduct(from: number, to: number) {
  return db
    .select({
      name: schema.orders.product,
      netKg: sql<number>`coalesce(sum(${schema.trips.netKg}), 0)`,
      trucks: sql<number>`count(*)`,
    })
    .from(schema.trips)
    .innerJoin(schema.orders, eq(schema.trips.orderId, schema.orders.id))
    .where(departedIn(from, to))
    .groupBy(schema.orders.product)
    .orderBy(desc(sql`2`));
}

export async function byDealer(from: number, to: number) {
  return db
    .select({
      name: schema.dealers.name,
      netKg: sql<number>`coalesce(sum(${schema.trips.netKg}), 0)`,
      trucks: sql<number>`count(*)`,
    })
    .from(schema.trips)
    .innerJoin(schema.orders, eq(schema.trips.orderId, schema.orders.id))
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))
    .where(departedIn(from, to))
    .groupBy(schema.dealers.id)
    .orderBy(desc(sql`2`))
    .limit(20);
}

/** Построчная выгрузка — то, что бухгалтер сверяет с 1С. */
export async function shipmentRows(from: number, to: number) {
  return db
    .select({
      departedAt: schema.trips.departedAt,
      orderNumber: schema.orders.number,
      waybillNo: schema.trips.waybillNo,
      dealer: schema.dealers.name,
      code1c: schema.dealers.code1c,
      product: schema.orders.product,
      destination: schema.orders.destination,
      plate: schema.trips.plate,
      driverName: schema.trips.driverName,
      grossKg: schema.trips.grossKg,
      tareKg: schema.trips.tareKg,
      netKg: schema.trips.netKg,
    })
    .from(schema.trips)
    .innerJoin(schema.orders, eq(schema.trips.orderId, schema.orders.id))
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))
    .where(departedIn(from, to))
    .orderBy(desc(schema.trips.departedAt));
}
