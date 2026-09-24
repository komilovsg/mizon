import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtDateTime, fmtTons, kgToTons } from "@/lib/format";
import { Badge, Gauge, orderTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireUser();
  const t = translator(await getLocale());

  const rows = await db
    .select({
      order: schema.orders,
      dealer: schema.dealers.name,
      shippedKg: sql<number>`coalesce((select sum(${schema.trips.netKg}) from ${schema.trips} where ${schema.trips.orderId} = ${schema.orders.id} and ${schema.trips.status} = 'departed'), 0)`,
      trucks: sql<number>`(select count(*) from ${schema.trips} where ${schema.trips.orderId} = ${schema.orders.id})`,
    })
    .from(schema.orders)
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))

    .orderBy(desc(schema.orders.createdAt))
    .limit(100);

  return (
    <>
      {/* Главное действие — создать заявку, поэтому кнопка занимает весь верх экрана. */}
      <Link href="/orders/new" className="btn btn-brand no-print block px-6 py-8 text-center text-2xl sm:text-3xl">
        {t("dealer.newBig")}
      </Link>

      <h2 className="title mt-10 mb-3 text-lg">{t("nav.orders")}</h2>

      {rows.length === 0 && <p className="text-muted">{t("order.empty")}</p>}

      <ul className="space-y-3">
        {rows.map(({ order, dealer, shippedKg, trucks }) => {
          const shipped = kgToTons(shippedKg);
          return (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="card block p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg leading-snug font-bold">{dealer}</p>
                    <p className="mt-0.5 text-muted">{order.product}</p>
                  </div>
                  <span className="shrink-0">
                    <Badge label={t(`status.${order.status}` as never)} tone={orderTone(order.status)} />
                  </span>
                </div>

                <p className="mt-3 leading-snug">{order.destination}</p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="num text-2xl font-extrabold">{fmtTons(shipped)}</span>
                  <span className="text-muted">
                    {t("order.of")} {order.tons} {t("t")}
                  </span>
                </div>
                <div className="mt-2">
                  <Gauge done={shipped} total={order.tons} />
                </div>

                <p className="label mt-3">
                  {/* «1 машины» режет глаз, поэтому число идёт после слова. */}
                  <span className="mono">{order.number}</span> · {fmtDateTime(order.createdAt)} ·{" "}
                  {t("trip.many")}: <span className="num">{trucks}</span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
