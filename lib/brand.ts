import type { Locale } from "./i18n";

/** Название продукта. Меняется здесь — подхватывается везде, включая PWA-манифест. */
export const BRAND: Record<Locale, { name: string; tagline: string }> = {
  ru: { name: "Мизон", tagline: "Заявки и отгрузка" },
  tg: { name: "Мизон", tagline: "Дархост ва боркунӣ" },
  en: { name: "Mizon", tagline: "Orders and dispatch" },
};
