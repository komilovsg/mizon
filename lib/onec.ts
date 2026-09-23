import { and, eq, lt } from "drizzle-orm";
import { db, schema } from "./db";

export type OutboxTopic =
  | "dealer.approved"  // -> Контрагент
  | "order.approved"   // -> Заказ клиента
  | "trip.departed"    // -> Реализация товаров / расходная накладная
  | "order.closed";

/**
 * Пишем событие в очередь, а не дёргаем 1С напрямую.
 * 1С может лежать, сеть на заводе может моргнуть — заявка от этого не теряется.
 */
export async function enqueue(topic: OutboxTopic, payload: unknown) {
  await db.insert(schema.outbox).values({ topic, payload: payload as object });
}

const MAX_ATTEMPTS = 8;

/** Вызывается по cron из /api/sync. Отправляет всё, что накопилось. */
export async function flushOutbox(limit = 25) {
  const url = process.env.ONEC_URL;
  if (!url) return { skipped: true as const, reason: "ONEC_URL не задан" };

  const pending = await db
    .select()
    .from(schema.outbox)
    .where(and(eq(schema.outbox.status, "pending"), lt(schema.outbox.attempts, MAX_ATTEMPTS)))
    .limit(limit);

  let sent = 0;
  for (const row of pending) {
    try {
      const res = await fetch(`${url}/${row.topic.replace(".", "/")}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `${row.topic}:${row.id}`,
          Authorization: `Basic ${Buffer.from(`${process.env.ONEC_USER}:${process.env.ONEC_PASSWORD}`).toString("base64")}`,
        },
        body: JSON.stringify(row.payload),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`1C ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const body = (await res.json().catch(() => ({}))) as { ref?: string; code?: string };
      await db
        .update(schema.outbox)
        .set({ status: "sent", sentAt: Math.floor(Date.now() / 1000), ref1c: body.ref ?? null })
        .where(eq(schema.outbox.id, row.id));

      // 1С завела контрагента и вернула его код — сохраняем, чтобы дальше ссылаться на него.
      if (row.topic === "dealer.approved") {
        const payload = row.payload as { dealerId?: number };
        const code = body.code ?? body.ref;
        if (payload?.dealerId && code) {
          await db.update(schema.dealers).set({ code1c: code }).where(eq(schema.dealers.id, payload.dealerId));
        }
      }
      sent++;
    } catch (e) {
      const attempts = row.attempts + 1;
      await db
        .update(schema.outbox)
        .set({
          attempts,
          lastError: e instanceof Error ? e.message : String(e),
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
        })
        .where(eq(schema.outbox.id, row.id));
    }
  }
  return { sent, total: pending.length };
}
