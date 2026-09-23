import type { DealerStatus, OrderStatus, TripStatus } from "@/lib/db/schema";

export function Plate({ value, large }: { value: string; large?: boolean }) {
  return <span className={`plate${large ? " plate-lg" : ""}`}>{value}</span>;
}

// Цвет несёт состояние: серый ждёт, оранжевый требует действия, зелёный закрыт.
const ORDER_TONE: Record<OrderStatus, string> = {
  new: "badge-orange",
  approved: "badge-green",
  rejected: "badge-grey",
  closed: "badge-blue",
  cancelled: "badge-grey",
};

const TRIP_TONE: Record<TripStatus, string> = {
  expected: "badge-grey",
  on_site: "badge-orange",
  loaded: "badge-blue",
  departed: "badge-green",
  cancelled: "badge-grey",
};

const DEALER_TONE: Record<DealerStatus, string> = {
  pending: "badge-orange",
  active: "badge-green",
  blocked: "badge-grey",
};

export const orderTone = (s: OrderStatus) => ORDER_TONE[s];
export const tripTone = (s: TripStatus) => TRIP_TONE[s];
export const dealerTone = (s: DealerStatus) => DEALER_TONE[s];

export function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={`badge ${tone}`}>{label}</span>;
}

export function Gauge({ done, total }: { done: number; total: number }) {
  const pct = Math.min(100, total > 0 ? (done / total) * 100 : 0);
  return (
    <div className="gauge" role="img" aria-label={`${Math.round(pct)}%`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
