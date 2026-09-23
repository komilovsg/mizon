import { fmtTons, kgToTons } from "@/lib/format";

/**
 * Палитра для разрезов. Прошла проверку валидатора на светлой подложке:
 * диапазон светлоты, порог насыщенности, различимость при дальтонизме и контраст.
 * Порядок фиксированный — цвет закреплён за позицией, а не за её местом в рейтинге.
 */
export const CATEGORICAL = ["#2563C9", "#E8590C", "#0D9488", "#7C3AED", "#A16207"] as const;
const SERIES = "#12875A";

/** Тонны по дням. Одна серия — легенда не нужна, её называет заголовок. */
export function DailyBars({
  data,
  unit,
  emptyLabel,
}: {
  data: { date: Date; netKg: number; trucks: number }[];
  unit: string;
  emptyLabel: string;
}) {
  const max = Math.max(...data.map((d) => d.netKg), 1);
  if (data.every((d) => d.netKg === 0)) return <p className="py-8 text-center text-muted">{emptyLabel}</p>;

  const wide = data.length > 14;

  return (
    <div className="chart-scroll">
      <div className="chart-bars" style={{ minWidth: wide ? `${data.length * 26}px` : undefined }}>
        {data.map((d) => {
          const pct = (d.netKg / max) * 100;
          const day = d.date.getDate();
          return (
            <div key={d.date.toISOString()} className="chart-col" title={`${d.date.toLocaleDateString("ru-RU")} — ${fmtTons(kgToTons(d.netKg))} ${unit}, ${d.trucks}`}>
              <div className="chart-track">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max(pct, d.netKg > 0 ? 3 : 0)}%`, background: SERIES }}
                />
              </div>
              <span className="chart-tick num">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Разрез по позициям: горизонтальные полосы с подписью прямо на строке. */
export function Breakdown({
  rows,
  unit,
  emptyLabel,
}: {
  rows: { name: string; netKg: number; trucks: number }[];
  unit: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-muted">{emptyLabel}</p>;
  const max = Math.max(...rows.map((r) => r.netKg), 1);

  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="leading-snug">{r.name}</span>
            <span className="num shrink-0 font-bold">
              {fmtTons(kgToTons(r.netKg))} {unit}
            </span>
          </div>
          <div className="chart-rowtrack mt-1.5">
            <div
              className="chart-rowbar"
              style={{ width: `${(r.netKg / max) * 100}%`, background: CATEGORICAL[i % CATEGORICAL.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="label">{label}</p>
      <p className="num mt-1 text-2xl leading-none font-extrabold">{value}</p>
      {sub && <p className="label mt-1.5">{sub}</p>}
    </div>
  );
}
