import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { LoginForm } from "@/components/login-form";
import { LangSwitch } from "@/components/lang-switch";

const DEMO = [
  { role: "role.dispatcher", phone: "+992900000001" },
  { role: "role.dealer", phone: "+992900000002" },
  { role: "role.gate", phone: "+992900000003" },
  { role: "role.scale", phone: "+992900000004" },
] as const;

export default async function LoginPage() {
  if (await currentUser()) redirect("/orders");
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="" width={40} height={40} className="rounded-xl" />
          <div>
            <p className="title text-2xl">{BRAND[locale].name}</p>
            <p className="label">{BRAND[locale].tagline}</p>
          </div>
        </div>
        <LangSwitch current={locale} />
      </header>

      <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-1 w-full max-w-sm lg:order-2 lg:justify-self-end">
          <h1 className="title mb-5 text-3xl">{t("login.title")}</h1>
          <LoginForm
            labels={{ phone: t("login.phone"), pin: t("login.pin"), submit: t("login.submit"), error: t("login.error") }}
          />
          <Link
            href="/register"
            className="mt-5 block font-semibold text-brand underline underline-offset-4"
          >
            {t("login.register")}
          </Link>

          <div className="mt-8 border-t border-line pt-4">
            <p className="label mb-2">{t("login.demo")} · PIN 1111</p>
            <ul className="mono space-y-1 text-sm text-muted">
              {DEMO.map((d) => (
                <li key={d.phone} className="flex justify-between gap-4">
                  <span className="font-sans">{t(d.role)}</span>
                  <span>{d.phone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Показываем то, ради чего заходят: одну заявку и машины по ней. */}
        <div className="card order-2 overflow-hidden lg:order-1">
          <div className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="label">{t("order.one")}</p>
              <p className="mono text-xl font-bold">ЗВ-260922-014</p>
            </div>
            <span className="badge badge-green">{t("status.approved")}</span>
          </div>

          <div className="flex items-end gap-6 px-5">
            <div>
              <p className="label">{t("order.loaded")}</p>
              <p className="num text-4xl leading-none font-extrabold">
                24,2<span className="text-xl text-muted">/30 {t("t")}</span>
              </p>
            </div>
          </div>
          <div className="px-5 pt-4">
            <div className="gauge">
              <span style={{ width: "81%" }} />
            </div>
          </div>

          <div className="mt-5 border-t border-line p-5">
            <p className="label mb-3">{t("trip.many")}</p>
            <ul className="space-y-3">
              {[
                { plate: "2701AB01", driver: "Раҳимов А. С.", net: "12,4", tone: "badge-green", st: "trip.status.departed" },
                { plate: "5512KM02", driver: "Сафаров Д. Н.", net: "11,8", tone: "badge-blue", st: "trip.status.loaded" },
              ].map((r) => (
                <li key={r.plate} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="plate">{r.plate}</span>
                    <span className="text-muted">{r.driver}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num font-bold">
                      {r.net} {t("t")}
                    </span>
                    <span className={`badge ${r.tone}`}>{t(r.st as never)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
