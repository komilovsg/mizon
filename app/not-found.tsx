import Link from "next/link";
import { getLocale, translator } from "@/lib/i18n";

export default async function NotFound() {
  const t = translator(await getLocale());
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <p className="label">404</p>
      <h1 className="title mt-2 text-3xl">{t("notfound.title")}</h1>
      <p className="mt-3 text-muted">{t("notfound.body")}</p>
      <Link href="/" className="btn btn-primary mt-8 text-center">
        {t("error.home")}
      </Link>
    </main>
  );
}
