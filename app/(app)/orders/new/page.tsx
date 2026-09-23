import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { createOrder } from "@/app/actions";
import { Field } from "@/components/ui";
import { TonsInput } from "@/components/tons-input";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const user = await requireUser("dealer", "dispatcher");
  const t = translator(await getLocale());

  if (user.role === "dealer") {
    const own = user.dealerId
      ? await db.query.dealers.findFirst({ where: eq(schema.dealers.id, user.dealerId) })
      : null;
    if (own?.status !== "active") redirect("/orders");
  }
  const dealers =
    user.role === "dealer" ? [] : await db.select().from(schema.dealers).where(eq(schema.dealers.status, "active"));
  const products = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.active, true))
    .orderBy(asc(schema.products.sortOrder));

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/orders" className="label hover:text-ink">
        ← {t("back")}
      </Link>
      <h1 className="title mt-3 mb-1 text-3xl">{t("nav.new")}</h1>
      {user.role !== "dealer" && <p className="mb-6 text-sm text-muted">{t("order.channel.phone")}</p>}

      <form action={createOrder} className="card mt-6 space-y-5 p-6">
        {user.role === "dealer" ? (
          <div>
            <p className="label">{t("order.dealer")}</p>
            <p className="mt-1 text-lg">{user.dealerName}</p>
          </div>
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

        <Field label={t("order.destination")}>
          <input name="destination" required maxLength={300} className="field" placeholder="Рӯдакӣ, склад «Сомон»" />
          <span className="mt-1 block text-xs text-muted">{t("order.destination.hint")}</span>
        </Field>

        <Field label={t("order.note")}>
          <textarea name="note" rows={2} maxLength={500} className="field" />
        </Field>

        <button className="btn btn-primary w-full text-lg">{t("order.create")}</button>
      </form>
    </div>
  );
}
