import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtDateTime, fmtTime, fmtTons, kgToTons } from "@/lib/format";
import { Badge, Field, Gauge, Plate, orderTone, tripTone } from "@/components/ui";
import { addTrip, closeOrder, decideOrder, gateOut, saveWeight } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const t = translator(await getLocale());
  const id = Number((await params).id);

  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, id) });
  if (!order) notFound();
  if (user.role === "dealer" && order.dealerId !== user.dealerId) notFound();

  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, order.dealerId) });
  const trips = await db.select().from(schema.trips).where(eq(schema.trips.orderId, id)).orderBy(asc(schema.trips.id));

  const shipped = kgToTons(trips.filter((x) => x.status === "departed").reduce((s, x) => s + (x.netKg ?? 0), 0));
  const canDecide = user.role === "dispatcher" || user.role === "admin";
  const canAddTruck = order.status === "approved" && ["dispatcher", "gate", "dealer", "admin"].includes(user.role);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/orders" className="label no-print hover:text-ink">
        ← {t("back")}
      </Link>

      <article className="card mt-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xl leading-snug font-bold">{dealer?.name}</p>
            <p className="label mt-1">
              <span className="mono">{order.number}</span> · {fmtDateTime(order.createdAt)}
            </p>
          </div>
          <Badge label={t(`status.${order.status}` as never)} tone={orderTone(order.status)} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="label">{t("order.product")}</dt>
            <dd className="mt-0.5 leading-snug">{order.product}</dd>
          </div>
          <div>
            <dt className="label">{t("order.destination")}</dt>
            <dd className="mt-0.5 leading-snug">{order.destination}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="num text-3xl font-extrabold">{fmtTons(shipped)}</span>
            <span className="text-muted">
              {t("order.of")} {order.tons} {t("t")} · {t("order.remaining")}{" "}
              <span className="num">{fmtTons(Math.max(0, order.tons - shipped))}</span>
            </span>
          </div>
          <div className="mt-2">
            <Gauge done={shipped} total={order.tons} />
          </div>
        </div>

        {order.status === "new" && canDecide && (
          <form action={decideOrder} className="no-print mt-6 flex flex-wrap gap-3">
            <input type="hidden" name="orderId" value={order.id} />
            <button name="decision" value="approve" className="btn btn-go flex-1 sm:flex-none">
              {t("order.approve")}
            </button>
            <button name="decision" value="reject" className="btn flex-1 sm:flex-none">
              {t("order.reject")}
            </button>
          </form>
        )}
      </article>

      <section className="mt-8">
        <h2 className="title mb-4 text-xl">{t("trip.many")}</h2>

        {trips.length === 0 && <p className="text-muted">{t("trip.empty")}</p>}

        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Plate value={trip.plate} />
                <Badge label={t(`trip.status.${trip.status}` as never)} tone={tripTone(trip.status)} />
              </div>
              <p className="mt-3 text-lg leading-snug font-bold">{trip.driverName}</p>

              <div className="label mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {trip.arrivedAt && (
                  <span>
                    {t("trip.arrived")} {fmtTime(trip.arrivedAt)}
                  </span>
                )}
                {trip.departedAt && (
                  <span>
                    {t("trip.left")} {fmtTime(trip.departedAt)}
                  </span>
                )}
                {trip.waybillNo && (
                  <span>
                    {t("waybill")} <span className="mono">{trip.waybillNo}</span>
                  </span>
                )}
              </div>

              {trip.netKg && (
                <p className="mt-3 text-lg">
                  {t("scale.net")}{" "}
                  <span className="num font-extrabold">
                    {fmtTons(kgToTons(trip.netKg))} {t("t")}
                  </span>
                </p>
              )}

              {trip.status === "on_site" && ["scale", "dispatcher", "admin"].includes(user.role) && (
                <form action={saveWeight} className="no-print mt-5 border-t border-line pt-5">
                  <p className="title mb-3 text-base">{t("scale.title")}</p>
                  <input type="hidden" name="tripId" value={trip.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("scale.gross")}>
                      <input name="grossKg" type="number" required min={1} inputMode="numeric" className="field num text-lg" />
                    </Field>
                    <Field label={t("scale.tare")}>
                      <input name="tareKg" type="number" required min={1} inputMode="numeric" className="field num text-lg" />
                    </Field>
                  </div>
                  <button className="btn btn-primary mt-4 w-full">{t("scale.save")}</button>
                </form>
              )}

              {trip.status === "loaded" && ["gate", "dispatcher", "admin"].includes(user.role) && (
                <form action={gateOut} className="no-print mt-5">
                  <input type="hidden" name="tripId" value={trip.id} />
                  <button className="btn btn-brand w-full sm:w-auto">{t("gate.out")}</button>
                </form>
              )}
            </li>
          ))}
        </ul>

        {canAddTruck && (
          <details id="add" open={trips.length === 0 || user.role === "gate"} className="no-print card mt-5 scroll-mt-24 p-5">
            <summary className="title cursor-pointer text-base">{t("trip.add")}</summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <form action={addTrip} className="contents">
                <input type="hidden" name="orderId" value={order.id} />
                <Field label={t("trip.plate")}>
                  <input
                    name="plate"
                    required
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    className="field field-mono text-xl"
                    placeholder="2701AB01"
                  />
                </Field>
                <Field label={t("trip.trailer")}>
                  <input name="trailerPlate" autoCapitalize="characters" autoCorrect="off" spellCheck={false} className="field field-mono text-xl" />
                </Field>
                <Field label={t("trip.driver")}>
                  <input name="driverName" required autoComplete="name" className="field" />
                </Field>
                <Field label={t("trip.driverPhone")}>
                  <input name="driverPhone" type="tel" className="field field-mono" />
                </Field>
                <button className="btn btn-primary sm:col-span-2">{t("save")}</button>
              </form>
            </div>
          </details>
        )}

        {canDecide && order.status === "approved" && (
          <form action={closeOrder} className="no-print mt-6">
            <input type="hidden" name="orderId" value={order.id} />
            <button className="btn">{t("order.close")}</button>
          </form>
        )}
      </section>
    </div>
  );
}
