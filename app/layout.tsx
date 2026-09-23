import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { getLocale } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import "./globals.css";

// Manrope несёт cyrillic-ext — без него ломаются таджикские ӯ ҷ қ ҳ ғ ӣ.
const manrope = Manrope({ subsets: ["cyrillic", "cyrillic-ext", "latin"], weight: ["500", "600", "700", "800"], variable: "--font-manrope" });
const plexMono = IBM_Plex_Mono({ subsets: ["cyrillic", "latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: `${BRAND.ru.name} — ${BRAND.ru.tagline.toLowerCase()}`,
  description: "Заявки дилеров, контроль въезда и выезда машин, накладные, обмен с 1С",
  appleWebApp: { capable: true, title: BRAND.ru.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#15171b",
  // Экран уходит под вырез и индикатор — отступы добираем через env(safe-area-inset-*).
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${manrope.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
