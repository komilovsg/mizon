import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtTons, kgToTons } from "@/lib/format";
import { PERIODS, byDay, byDealer, byProduct, range, totals } from "@/lib/reports";
import { Breakdown, DailyBars, Stat } from "@/components/charts";

export const dynamic = "force-dynamic";

const LABEL: Record<number, "rep.today" | "rep.d7" | "rep.d30" | "rep.d90"> = {
  1: "rep.today",
  7: "rep.d7",
  30: "rep.d30",
  90: "rep.d90",
};

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireUser("dispatcher", "admin");
  const t = translator(await getLocale());

  const asked = Number((await searchParams).days);
  const days = (PERIODS as readonly number[]).includes(asked) ? asked : 7;
  const { from, to, start } = range(days);

  const [sum, daily, products, dealers] = await Promise.all([
    totals(from, to),
    byDay(from, to, start, days),
    byProduct(from, to),
    byDealer(from, to),
  ]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title text-3xl">{t("rep.title")}</h1>
        <a href={`/reports/export?days=${days}`} className="btn no-print">
          {t("rep.export")}
        </a>
      </div>

      {/* Фильтр периода — одной строкой над графиками. */}
      <nav aria-label={t("rep.period")} className="no-print mb-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/reports?days=${p}`}
            aria-current={p === days ? "page" : undefined}
            className="chip flex items-center"
          >
            {t(LABEL[p])}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t("rep.shipped")}
          value={`${fmtTons(kgToTons(sum.shippedKg))} ${t("t")}`}
          sub={`${t("rep.ordered")}: ${sum.orderedTons} ${t("t")}`}
        />
        <Stat label={t("rep.departed")} value={String(sum.departed)} sub={`${t("rep.arrived")}: ${sum.arrived}`} />
        <Stat label={t("rep.avg")} value={`${fmtTons(kgToTons(sum.avgKg))} ${t("t")}`} />
        {/* План и факт рядом: сколько просили и сколько реально вывезли. */}
        <Stat
          label={t("rep.ordered")}
          value={`${sum.orderedTons} ${t("t")}`}
          sub={`${t("rep.ordersMade")}: ${sum.orders}`}
        />
      </div>

      <section className="card mt-6 p-5">
        <h2 className="title mb-4 text-lg">{t("rep.byDay")}</h2>
        <DailyBars data={daily} unit={t("t")} emptyLabel={t("rep.empty")} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="title mb-4 text-lg">{t("rep.byProduct")}</h2>
          <Breakdown rows={products} unit={t("t")} emptyLabel={t("rep.empty")} />
        </section>

        <section className="card p-5">
          <h2 className="title mb-4 text-lg">{t("rep.byDealer")}</h2>
          {dealers.length === 0 ? (
            <p className="py-6 text-center text-muted">{t("rep.empty")}</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("nav.dealers")}</th>
                    <th>{t("rep.trucksShort")}</th>
                    <th>{t("order.tons")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((d) => (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td className="num">{d.trucks}</td>
                      <td className="num font-bold">{fmtTons(kgToTons(d.netKg))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
