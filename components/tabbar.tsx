"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type Tab = { href: string; label: string };

export function TabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <nav className="tabbar no-print" aria-label="Разделы">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={pathname.startsWith(tab.href) ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
