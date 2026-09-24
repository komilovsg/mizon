import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getLocale, translator } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { LangSwitch } from "@/components/lang-switch";
import { TabBar } from "@/components/tabbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const t = translator(locale);

  // Входа нет, ролей на экране тоже: все разделы открыты каждому.
  const links = [
    { href: "/board", label: t("nav.board") },
    { href: "/orders", label: t("nav.orders") },
    { href: "/gate", label: t("nav.gate") },
    { href: "/reports", label: t("nav.reports") },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
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

          <div className="ml-auto flex items-center gap-2">
            <LangSwitch current={locale} />
          </div>
        </div>
      </header>

      <main className="has-tabbar mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-5 sm:py-8">{children}</main>

      {links.length > 1 && <TabBar tabs={links.map(({ href, label }) => ({ href, label }))} />}
    </div>
  );
}
