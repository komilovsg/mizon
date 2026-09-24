import { setLocale } from "@/app/actions";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n";

export function LangSwitch({ current }: { current: Locale }) {
  return (
    <form action={setLocale} className="flex border border-line bg-card">
      {LOCALES.map((l) => (
        <button
          key={l}
          name="locale"
          value={l}
          className={`px-2.5 py-1 text-xs whitespace-nowrap tracking-widest uppercase ${
            l === current ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
          aria-current={l === current}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </form>
  );
}
