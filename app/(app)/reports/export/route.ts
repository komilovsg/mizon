import { currentUser } from "@/lib/session";
import { PERIODS, range, shipmentRows } from "@/lib/reports";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Дата выезда",
  "Заявка",
  "Накладная",
  "Дилер",
  "Код 1С",
  "Товар",
  "Назначение",
  "Госномер",
  "Водитель",
  "Брутто, кг",
  "Тара, кг",
  "Нетто, кг",
  "Нетто, т",
];

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !["dispatcher", "admin"].includes(user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const asked = Number(new URL(req.url).searchParams.get("days"));
  const days = (PERIODS as readonly number[]).includes(asked) ? asked : 7;
  const { from, to } = range(days);
  const rows = await shipmentRows(from, to);

  const lines = [
    HEADERS.join(";"),
    ...rows.map((r) =>
      [
        r.departedAt ? new Date(r.departedAt * 1000).toLocaleString("ru-RU") : "",
        r.orderNumber,
        r.waybillNo,
        r.dealer,
        r.code1c,
        r.product,
        r.destination,
        r.plate,
        r.driverName,
        r.grossKg,
        r.tareKg,
        r.netKg,
        r.netKg ? (r.netKg / 1000).toFixed(3).replace(".", ",") : "",
      ]
        .map(cell)
        .join(";"),
    ),
  ];

  // BOM — иначе Excel открывает кириллицу кракозябрами.
  const csv = "﻿" + lines.join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="otgruzka-${days}d.csv"`,
    },
  });
}
