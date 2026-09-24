import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtDateTime, fmtTons, kgToTons } from "@/lib/format";
import { Badge, Gauge, orderTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();
  const t = translator(await getLocale());

  const ownDealer =
    user.role === "dealer" && user.dealerId
      ? await db.query.dealers.findFirst({ where: eq(schema.dealers.id, user.dealerId) })
      : null;
  const isDealer = user.role === "dealer";
  const canOrder = !isDealer || ownDealer?.status === "active";

  const rows = await db
    .select({
      order: schema.orders,
      dealer: schema.dealers.name,
      shippedKg: sql<number>`coalesce((select sum(${schema.trips.netKg}) from ${schema.trips} where ${schema.trips.orderId} = ${schema.orders.id} and ${schema.trips.status} = 'departed'), 0)`,
      trucks: sql<number>`(select count(*) from ${schema.trips} where ${schema.trips.orderId} = ${schema.orders.id})`,
    })
    .from(schema.orders)
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))
    .where(isDealer ? eq(schema.orders.dealerId, user.dealerId!) : sql`1=1`)
    .orderBy(desc(schema.orders.createdAt))
    .limit(100);

  /*
   * У дилера один сценарий — оставить заявку. Всё остальное на его экране
   * только мешает, поэтому здесь кнопка во весь экран, а список под ней.
   */
  if (isDealer) {
    return (
      <>
        {ownDealer && ownDealer.status !== "active" ? (
          <p className="note note-warn">
            {ownDealer.status === "pending" ? t("dealer.pendingNotice") : t("dealer.blockedNotice")}
          </p>
        ) : (
          <Link href="/orders/new" className="btn btn-brand no-print block px-6 py-10 text-center text-3xl">
            {t("dealer.newBig")}
          </Link>
        )}

        {rows.length > 0 && (
          <section className="mt-10">
            <h2 className="title mb-3 text-lg">{t("dealer.myOrders")}</h2>
            <ul className="space-y-2">
              {rows.map(({ order }) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                    <span className="num text-lg font-bold">
                      {order.tons} {t("t")}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{order.destination}</span>
                    <Badge label={t(`status.${order.status}` as never)} tone={orderTone(order.status)} />
                    <span className="label w-full sm:w-auto">{fmtDateTime(order.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title text-3xl">{t("nav.orders")}</h1>
        {canOrder && (
          <Link href="/orders/new" className="btn btn-brand no-print w-full sm:w-auto">
            {t("nav.new")}
          </Link>
        )}
      </div>

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
                  <span className="mono">{order.number}</span> · {fmtDateTime(order.createdAt)} · {trucks}{" "}
                  {t("trip.many").toLowerCase()}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
