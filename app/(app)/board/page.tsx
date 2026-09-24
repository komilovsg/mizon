import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtTime } from "@/lib/format";
import { Board, type BoardCard, type Column } from "@/components/board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  await requireUser("dispatcher", "gate", "scale");
  const t = translator(await getLocale());
  const midnight = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  const rows = await db
    .select({
      trip: schema.trips,
      dealer: schema.dealers.name,
      destination: schema.orders.destination,
      orderNumber: schema.orders.number,
    })
    .from(schema.trips)
    .innerJoin(schema.orders, eq(schema.trips.orderId, schema.orders.id))
    .innerJoin(schema.dealers, eq(schema.orders.dealerId, schema.dealers.id))
    .where(eq(schema.orders.status, "approved"))
    .orderBy(desc(schema.trips.id))
    .limit(200);

  const toCard = (r: (typeof rows)[number]): BoardCard => ({
    id: r.trip.id,
    orderId: r.trip.orderId,
    plate: r.trip.plate,
    driverName: r.trip.driverName,
    truckModel: r.trip.truckModel,
    dealer: r.dealer,
    destination: r.destination,
    orderNumber: r.orderNumber,
    netKg: r.trip.netKg,
    status: r.trip.status,
    time: fmtTime(r.trip.departedAt ?? r.trip.loadedAt ?? r.trip.arrivedAt ?? r.trip.createdAt),
  });

  const pick = (status: schema.TripStatus) => rows.filter((r) => r.trip.status === status).map(toCard);

  // Выехавшие копились бы бесконечно — оставляем только сегодняшние.
  const departedToday = rows
    .filter((r) => r.trip.status === "departed" && (r.trip.departedAt ?? 0) >= midnight)
    .map(toCard);

  const columns: Column[] = [
    { status: "expected", label: t("trip.status.expected"), cards: pick("expected") },
    { status: "on_site", label: t("trip.status.on_site"), cards: pick("on_site") },
    { status: "loaded", label: t("trip.status.loaded"), cards: pick("loaded") },
    { status: "departed", label: t("trip.status.departed"), cards: departedToday },
  ];

  return (
    <>
      <h1 className="title mb-4 text-3xl">{t("board.title")}</h1>
      <Board
        columns={columns}
        labels={{
          empty: t("board.empty"),
          hint: t("board.dragHint"),
          in: t("gate.in"),
          out: t("gate.out"),
          needWeight: t("board.needWeight"),
          net: t("scale.net"),
          t: t("t"),
        }}
      />
    </>
  );
}
