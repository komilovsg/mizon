export const kgToTons = (kg?: number | null) => (kg ? kg / 1000 : 0);

export const fmtTons = (t: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(t);

export const fmtDateTime = (unix?: number | null) =>
  unix ? new Date(unix * 1000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export const fmtTime = (unix?: number | null) =>
  unix ? new Date(unix * 1000).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—";

/** ЗВ-260922-014 — дата + счётчик за день, читается вслух по телефону. */
export function orderNumber(seqToday: number, at = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `ЗВ-${p(at.getFullYear() % 100)}${p(at.getMonth() + 1)}${p(at.getDate())}-${String(seqToday).padStart(3, "0")}`;
}

export const normalizePlate = (s: string) => s.toUpperCase().replace(/[\s-]/g, "");
