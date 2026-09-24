import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { fmtDateTime } from "@/lib/format";
import { createOrder } from "@/app/actions";
import { Field } from "@/components/ui";
import { TonsInput } from "@/components/tons-input";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const user = await requireUser("dealer", "dispatcher");
  const t = translator(await getLocale());
  const isDealer = user.role === "dealer";

  if (isDealer) {
    const own = user.dealerId
      ? await db.query.dealers.findFirst({ where: eq(schema.dealers.id, user.dealerId) })
      : null;
    if (own?.status !== "active") redirect("/orders");
  }

  const dealers = isDealer
    ? []
    : await db.select().from(schema.dealers).where(eq(schema.dealers.status, "active"));
  const products = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.active, true))
    .orderBy(asc(schema.products.sortOrder));

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/orders" className="label no-print hover:text-ink">
        ← {t("back")}
      </Link>
      <h1 className="title mt-3 text-3xl">{t("nav.new")}</h1>
      {!isDealer && <p className="mt-1 text-muted">{t("order.channel.phone")}</p>}

      <form action={createOrder} className="card mt-5 space-y-6 p-5 sm:p-6">
        {/* Дата проставляется сама — показываем, чтобы дилер видел, что она в заявке есть. */}
        <div>
          <p className="label">{t("order.when")}</p>
          <p className="num mt-0.5 text-lg">{fmtDateTime(Math.floor(Date.now() / 1000))}</p>
        </div>

        <Field label={t("order.product")}>
          <select name="productId" required className="field" defaultValue={products[0]?.id}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <TonsInput label={t("order.tons")} unit={t("t")} />

        {isDealer ? (
          <Field label={t("order.contact")}>
            <input
              name="contactName"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={user.name}
              className="field"
            />
            <span className="label mt-1 block">{t("order.contact.hint")}</span>
          </Field>
        ) : (
          <Field label={t("order.dealer")}>
            <select name="dealerId" required className="field" defaultValue="">
              <option value="" disabled>
                {t("order.dealerPick")}
              </option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label={t("order.destination")}>
          <input name="destination" required maxLength={300} className="field" placeholder="Рӯдакӣ, склад «Сомон»" />
          <span className="label mt-1 block">{t("order.destination.hint")}</span>
        </Field>

        {/* Машину дилер знает заранее: на воротах охране останется только сверить номер. */}
        <fieldset className="space-y-4 border-t border-line pt-5">
          <legend className="title text-lg">{t("order.truck")}</legend>

          <Field label={t("trip.driver")}>
            <input name="driverName" required={isDealer} maxLength={120} autoComplete="name" className="field" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("trip.model")}>
              <input name="truckModel" maxLength={60} className="field" placeholder={t("trip.model.hint")} />
            </Field>
            <Field label={t("trip.plate")}>
              <input
                name="plate"
                required={isDealer}
                maxLength={20}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="field field-mono text-xl"
                placeholder="2701AB01"
              />
            </Field>
          </div>
        </fieldset>

        {!isDealer && (
          <Field label={t("order.note")}>
            <textarea name="note" rows={2} maxLength={500} className="field" />
          </Field>
        )}

        <button className="btn btn-brand btn-xl">{t("order.create")}</button>
      </form>
    </div>
  );
}
