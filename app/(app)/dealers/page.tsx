import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtDateTime } from "@/lib/format";
import { Badge, dealerTone } from "@/components/ui";
import { setDealerStatus } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function DealersPage() {
  await requireUser("dispatcher");
  const t = translator(await getLocale());

  const rows = await db
    .select({
      dealer: schema.dealers,
      contact: schema.users.name,
      orders: sql<number>`(select count(*) from ${schema.orders} where ${schema.orders.dealerId} = ${schema.dealers.id})`,
    })
    .from(schema.dealers)
    .leftJoin(schema.users, eq(schema.users.dealerId, schema.dealers.id))
    .orderBy(desc(schema.dealers.id));

  const pending = rows.filter((r) => r.dealer.status === "pending");
  const rest = rows.filter((r) => r.dealer.status !== "pending");

  return (
    <>
      <h1 className="title mb-6 text-2xl sm:text-3xl">{t("nav.dealers")}</h1>

      {rows.length === 0 && <p className="mt-8 text-muted">{t("dealer.empty")}</p>}

      {pending.length > 0 && (
        <section className="mt-10">
          <h2 className="title mb-3 text-lg">
            {t("dealer.waiting")} · {pending.length}
          </h2>
          <ul className="space-y-3">
            {pending.map((r) => (
              <DealerCard key={r.dealer.id} row={r} t={t} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="title mb-3 text-lg">
          {t("dealer.working")} · {rest.length}
        </h2>
        <ul className="space-y-3">
          {rest.map((r) => (
            <DealerCard key={r.dealer.id} row={r} t={t} />
          ))}
        </ul>
      </section>
    </>
  );
}

type Row = {
  dealer: typeof schema.dealers.$inferSelect;
  contact: string | null;
  orders: number;
};

function DealerCard({ row, t }: { row: Row; t: (k: never) => string }) {
  const { dealer } = row;
  return (
    <li className="card p-4 sm:p-5">
      <div className="flex flex-wrap-reverse items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-tight">{dealer.name}</p>
          <p className="mt-1 text-sm text-muted">
            {row.contact ? <>{row.contact} · </> : null}
            <span className="mono">{dealer.phone}</span>
            {dealer.inn ? <> · ИНН <span className="mono">{dealer.inn}</span></> : null}
          </p>
          <p className="label mt-2">
            {fmtDateTime(dealer.createdAt)}
            {dealer.code1c ? ` · 1С ${dealer.code1c}` : ` · ${t("sync.pending" as never)}`}
          </p>
        </div>
        <span className="shrink-0">
          <Badge label={t(`dealer.status.${dealer.status}` as never)} tone={dealerTone(dealer.status)} />
        </span>
      </div>

      <div className="no-print mt-4 flex flex-wrap gap-3">
        {dealer.status !== "active" && (
          <form action={setDealerStatus} className="flex-1 sm:flex-none">
            <input type="hidden" name="dealerId" value={dealer.id} />
            <input type="hidden" name="status" value="active" />
            <button className="btn btn-go w-full">
              {dealer.status === "pending" ? t("dealer.approve" as never) : t("dealer.unblock" as never)}
            </button>
          </form>
        )}
        {/* Блокировка — редкое и болезненное действие, поэтому она не выглядит как главная кнопка. */}
        {dealer.status === "active" && (
          <form action={setDealerStatus}>
            <input type="hidden" name="dealerId" value={dealer.id} />
            <input type="hidden" name="status" value="blocked" />
            <button className="py-2 text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink">
              {t("dealer.block" as never)}
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
