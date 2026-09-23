import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { LangSwitch } from "@/components/lang-switch";
import { TabBar } from "@/components/tabbar";
import { logout } from "@/app/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const t = translator(locale);

  const links = [
    { href: "/board", label: t("nav.board"), roles: ["dispatcher", "gate", "scale", "admin"] },
    { href: "/orders", label: t("nav.orders"), roles: ["dealer", "dispatcher", "scale", "admin"] },
    { href: "/gate", label: t("nav.gate"), roles: ["gate", "dispatcher", "admin"] },
    { href: "/reports", label: t("nav.reports"), roles: ["dispatcher", "admin"] },
    { href: "/dealers", label: t("nav.dealers"), roles: ["dispatcher", "admin"] },
  ].filter((l) => l.roles.includes(user.role));

  // Дилеру внизу нужна не навигация, а сама кнопка «новая заявка» — ради неё он и заходит.


  return (
    <div className="min-h-dvh">
      <header className="no-print sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-x-5 px-4 py-2.5 sm:px-5 sm:py-3">
          <Link href={links[0]?.href ?? "/orders"} className="flex items-center gap-2">
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            <span className="title text-xl">{BRAND[locale].name}</span>
          </Link>
          {/* На телефоне разделы уезжают в нижнюю панель — до верха экрана рука не дотягивается. */}
          <nav className="hidden gap-4 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="title text-sm text-muted hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <span className="label ml-auto hidden truncate lg:inline">
            {user.name}
            {user.dealerName ? ` · ${user.dealerName}` : ""}
          </span>
          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <LangSwitch current={locale} />
            <form action={logout}>
              <button className="label px-2 py-2 hover:text-ink">{t("logout")}</button>
            </form>
          </div>
        </div>
      </header>

      <main className="has-tabbar mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">{children}</main>

      {links.length > 1 && <TabBar tabs={links.map(({ href, label }) => ({ href, label }))} />}
    </div>
  );
}
