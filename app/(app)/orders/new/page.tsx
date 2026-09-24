import Link from "next/link";
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
  await requireUser();
  const t = translator(await getLocale());

  // Подсказки, чтобы «ООО Сомон» и «ООО Сомон Строй» не разъехались в два контрагента.
  const dealers = await db
    .select({ name: schema.dealers.name })
    .from(schema.dealers)
    .where(eq(schema.dealers.status, "active"))
    .orderBy(asc(schema.dealers.name));
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

        <Field label={t("order.contact")}>
          <input
            name="contactName"
            required
            maxLength={120}
            list="known-dealers"
            autoComplete="off"
            className="field"
          />
          <datalist id="known-dealers">
            {dealers.map((d) => (
              <option key={d.name} value={d.name} />
            ))}
          </datalist>
          <span className="label mt-1 block">{t("order.contact.hint")}</span>
        </Field>

        <Field label={t("order.destination")}>
          <input name="destination" required maxLength={300} className="field" placeholder="Рӯдакӣ, склад «Сомон»" />
          <span className="label mt-1 block">{t("order.destination.hint")}</span>
        </Field>

        {/* Машину дилер знает заранее: на воротах охране останется только сверить номер. */}
        <fieldset className="space-y-4 border-t border-line pt-5">
          <legend className="title text-lg">{t("order.truck")}</legend>

          <Field label={t("trip.driver")}>
            <input name="driverName" required maxLength={120} autoComplete="name" className="field" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("trip.model")}>
              <input name="truckModel" maxLength={60} className="field" placeholder={t("trip.model.hint")} />
            </Field>
            <Field label={t("trip.plate")}>
              <input
                name="plate"
                required
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

        <button className="btn btn-brand btn-xl">{t("order.create")}</button>
      </form>
    </div>
  );
}
