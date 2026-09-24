import Link from "next/link";
import { and, desc, eq, like, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtTime, fmtTons, kgToTons, normalizePlate } from "@/lib/format";
import { Badge, Plate, tripTone } from "@/components/ui";
import { gateIn, gateOut } from "@/app/actions";

export const dynamic = "force-dynamic";

type Row = { trip: typeof schema.trips.$inferSelect; number: string; dealer: string; destination: string };
type T = (k: never) => string;

function tripsQuery() {
  return db
    .select({
      trip: schema.trips,
      number: schema.orders.number,
      dealer: schema.dealers.name,
      destination: schema.orders.destination,
    })
    .from(schema.trips)
    .innerJoin(schema.orders, eq(schema.trips.orderId, schema.orders.id))
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id));
}

export default async function GatePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser("gate", "dispatcher");
  const t = translator(await getLocale());
  const q = (await searchParams).q?.trim() ?? "";

  let found: Row[] = [];
  let openOrders: { id: number; number: string; dealer: string; destination: string; tons: number }[] = [];
  if (q) {
    const p = `%${normalizePlate(q)}%`;
    found = await tripsQuery()
      .where(or(like(schema.trips.plate, p), like(schema.orders.number, `%${q.toUpperCase()}%`)))
      .orderBy(desc(schema.trips.id))
      .limit(20);

    // Машина у ворот, а в системе её нет: охрана ищет заявку и заводит машину прямо здесь.
    openOrders = await db
      .select({
        id: schema.orders.id,
        number: schema.orders.number,
        dealer: schema.dealers.name,
        destination: schema.orders.destination,
        tons: schema.orders.tons,
      })
      .from(schema.orders)
      .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))
      .where(
        and(
          eq(schema.orders.status, "approved"),
          or(like(schema.orders.number, `%${q.toUpperCase()}%`), like(schema.dealers.name, `%${q}%`)),
        ),
      )
      .orderBy(desc(schema.orders.id))
      .limit(10);
  }

  const onSite = await tripsQuery().where(eq(schema.trips.status, "on_site")).orderBy(schema.trips.arrivedAt);
  const loaded = await tripsQuery().where(eq(schema.trips.status, "loaded")).orderBy(schema.trips.loadedAt);
  const expected = await tripsQuery()
    .where(and(eq(schema.trips.status, "expected"), eq(schema.orders.status, "approved")))
    .orderBy(desc(schema.trips.id))
    .limit(30);

  const here = [...loaded, ...onSite];

  return (
    <>
      <h1 className="title text-2xl sm:text-3xl">{t("gate.title")}</h1>

      {/* Поиск липнет к верху: охрана держит телефон и сверяет номер, не прокручивая. */}
      <form className="sticky top-[57px] z-[5] -mx-4 mt-4 flex gap-2 bg-bg/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className="field field-mono text-xl"
          placeholder={t("gate.search")}
          aria-label={t("gate.search")}
        />
        <button className="btn btn-primary px-6">OK</button>
      </form>

      {q && (
        <section className="mt-6 space-y-3">
          {found.length === 0 && openOrders.length === 0 && <p className="note note-warn">{t("gate.nothing")}</p>}
          {found.length > 0 && (
            <ul className="space-y-3">
              {found.map((r) => (
                <TripCard key={r.trip.id} row={r} t={t} big />
              ))}
            </ul>
          )}
          {openOrders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}#add`} className="card block p-5">
              <p className="text-lg font-bold">{o.dealer}</p>
              <p className="mt-1 text-muted">
                {o.tons} {t("t")} → {o.destination}
              </p>
              <p className="label mono mt-1">{o.number}</p>
              <span className="btn btn-brand mt-4 w-full">{t("trip.add")}</span>
            </Link>
          ))}
        </section>
      )}

      <Section title={t("gate.onSite")} count={here.length}>
        {here.map((r) => (
          <TripCard key={r.trip.id} row={r} t={t} />
        ))}
      </Section>

      <Section title={t("gate.expected")} count={expected.length}>
        {expected.map((r) => (
          <TripCard key={r.trip.id} row={r} t={t} />
        ))}
      </Section>
    </>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="title mb-3 text-lg">
        {title} · <span className="num">{count}</span>
      </h2>
      {count === 0 ? <p className="text-muted">—</p> : <ul className="space-y-3">{children}</ul>}
    </section>
  );
}

function TripCard({ row, t, big }: { row: Row; t: T; big?: boolean }) {
  const { trip } = row;
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Plate value={trip.plate} large={big} />
        <Badge label={t(`trip.status.${trip.status}` as never)} tone={tripTone(trip.status)} />
      </div>

      {/* Марка помогает сверить карточку с тем, что реально стоит у ворот. */}
      {trip.truckModel && <p className="mt-2.5 font-semibold">{trip.truckModel}</p>}
      <p className="mt-1 text-lg leading-snug font-bold">{trip.driverName}</p>
      <p className="mt-1 text-muted">
        {row.dealer} → {row.destination}
      </p>
      <p className="label mt-2">
        <Link href={`/orders/${trip.orderId}`} className="mono underline underline-offset-2">
          {row.number}
        </Link>
        {trip.arrivedAt ? ` · ${t("trip.arrived" as never)} ${fmtTime(trip.arrivedAt)}` : ""}
        {trip.netKg ? ` · ${t("scale.net" as never)} ${fmtTons(kgToTons(trip.netKg))} ${t("t" as never)}` : ""}
      </p>

      <div className="no-print mt-4">
        {trip.status === "expected" && (
          <form action={gateIn}>
            <input type="hidden" name="tripId" value={trip.id} />
            <button className="btn btn-go btn-xl">{t("gate.in" as never)}</button>
          </form>
        )}
        {trip.status === "loaded" && (
          <form action={gateOut}>
            <input type="hidden" name="tripId" value={trip.id} />
            <button className="btn btn-brand btn-xl">{t("gate.out" as never)}</button>
          </form>
        )}
        {/* Кнопки нет намеренно — объясняем почему, иначе охрана решит, что программа сломалась. */}
        {trip.status === "on_site" && <p className="note note-warn">{t("gate.waitScale" as never)}</p>}
      </div>
    </li>
  );
}
