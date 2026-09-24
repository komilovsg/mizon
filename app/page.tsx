import Link from "next/link";
import { getLocale, translator, type Key } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { LangSwitch } from "@/components/lang-switch";


export const dynamic = "force-dynamic";

/* Входа нет: разделы открыты, карточки просто ведут на нужный экран. */
const SECTIONS = [
  { key: "dispatcher", href: "/board", tone: "badge-blue" },
  { key: "dealer", href: "/orders/new", tone: "badge-green" },
  { key: "gate", href: "/gate", tone: "badge-orange" },
  { key: "scale", href: "/board", tone: "badge-grey" },
] as const;

export default async function LandingPage() {
  const locale = await getLocale();
  const t = translator(locale);

  const before = ["lp.before.1", "lp.before.2", "lp.before.3", "lp.before.4", "lp.before.5"] as Key[];
  const after = ["lp.after.1", "lp.after.2", "lp.after.3", "lp.after.4", "lp.after.5"] as Key[];
  const flow = [1, 2, 3, 4].map((n) => ({ n, title: `lp.flow.${n}` as Key, body: `lp.flow.${n}d` as Key }));
  const demo = ["lp.demo.1", "lp.demo.2", "lp.demo.3", "lp.demo.4"] as Key[];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
          <img src="/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
          <div className="mr-auto leading-tight">
            <p className="title text-lg">{BRAND[locale].name}</p>
            <p className="label hidden sm:block">{BRAND[locale].tagline}</p>
          </div>
          <LangSwitch current={locale} />
          <Link href="/orders" className="btn hidden sm:inline-flex">
            {t("lp.hero.login")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="py-12 sm:py-16">
          <h1 className="title max-w-3xl text-3xl sm:text-5xl">{t("lp.hero.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{t("lp.hero.lead")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/orders/new" className="btn btn-brand text-lg">
              {t("lp.hero.cta")}
            </Link>
            {/* Вход уже стоит в шапке; вторая такая же кнопка ничего не добавляет. */}
            <a href="#flow" className="btn text-lg">
              {t("lp.flow.title")}
            </a>
          </div>
          <p className="note note-ok mt-7 max-w-2xl">{t("lp.hero.note")}</p>
        </section>

        {/* Разница видна только рядом: слева бумага, справа то же самое в программе. */}
        <section className="grid gap-4 pb-14 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="title text-xl">{t("lp.before.title")}</h2>
            <ul className="mt-4 space-y-3">
              {before.map((k) => (
                <li key={k} className="flex gap-3 text-muted">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="title text-xl">{t("lp.after.title")}</h2>
            <ul className="mt-4 space-y-3">
              {after.map((k) => (
                <li key={k} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-go" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Главный экран лендинга: человек ищет здесь себя, а не описание продукта. */}
        <section id="roles" className="scroll-mt-20 pb-14">
          <h2 className="title text-2xl sm:text-3xl">{t("lp.roles.title")}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t("lp.roles.lead")}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SECTIONS.map((role) => (
              <article key={role.key} className="card flex flex-col p-6">
                <span className={`badge ${role.tone} self-start`}>{t(`role.${role.key}` as Key)}</span>

                <dl className="mt-4 flex-1 space-y-3">
                  <div>
                    <dt className="label">{t("lp.roles.job")}</dt>
                    <dd className="mt-0.5 leading-snug">{t(`lp.r.${role.key}.job` as Key)}</dd>
                  </div>
                  <div>
                    <dt className="label">{t("lp.roles.look")}</dt>
                    <dd className="mt-0.5 leading-snug text-muted">{t(`lp.r.${role.key}.look` as Key)}</dd>
                  </div>
                </dl>

                <Link href={role.href} className="btn btn-primary mt-5 w-full">
                  {t("lp.roles.enter")}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="flow" className="scroll-mt-20 pb-14">
          <h2 className="title text-2xl sm:text-3xl">{t("lp.flow.title")}</h2>
          {/* Нумерация тут не украшение: это настоящая последовательность, и порядок нельзя нарушить. */}
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step) => (
              <li key={step.n} className="card p-5">
                <span className="num text-3xl leading-none font-extrabold text-brand">{step.n}</span>
                <h3 className="title mt-3 text-lg">{t(step.title)}</h3>
                <p className="mt-1.5 leading-snug text-muted">{t(step.body)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-14">
          <div className="grid gap-4 lg:grid-cols-2">
            <figure className="card overflow-hidden">
              <img src="/shots/board.png" alt={t("board.title")} className="w-full" />
              <figcaption className="label border-t border-line p-4">{t("nav.board")}</figcaption>
            </figure>
            <figure className="card overflow-hidden">
              <img src="/shots/reports.png" alt={t("rep.title")} className="h-full w-full object-cover object-top" />
              <figcaption className="label border-t border-line p-4">{t("nav.reports")}</figcaption>
            </figure>
          </div>
        </section>

        <section className="pb-14">
          <div className="card p-6 sm:p-8">
            <h2 className="title text-2xl">{t("lp.onec.title")}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{t("lp.onec.body")}</p>
          </div>
        </section>

        <section className="pb-14">
          <h2 className="title text-2xl sm:text-3xl">{t("lp.demo.title")}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {demo.map((k) => (
              <li key={k} className="card p-5 leading-snug">
                {t(k)}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl space-y-2 px-5 py-8">
          <p className="text-muted">{t("lp.langs")}</p>
          <p className="font-semibold">{t("lp.feedback")}</p>
        </div>
      </footer>
    </div>
  );
}
