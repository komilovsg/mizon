import Link from "next/link";
import { getLocale, translator } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { LangSwitch } from "@/components/lang-switch";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
      <header className="flex items-start justify-between">
        <Link href="/" className="title text-2xl">
          {BRAND[locale].name}
        </Link>
        <LangSwitch current={locale} />
      </header>

      <div className="py-10">
        <h1 className="title text-3xl">{t("reg.title")}</h1>
        <p className="mt-3 text-muted">{t("reg.lead")}</p>

        <div className="mt-6">
          <RegisterForm
            labels={{
              company: t("reg.company"),
              inn: t("reg.inn"),
              contact: t("reg.contact"),
              phone: t("reg.phone"),
              pin: t("reg.pin"),
              submit: t("reg.submit"),
              done: t("reg.done"),
              doneBody: t("reg.doneBody"),
              taken: t("reg.taken"),
              invalid: t("login.error"),
              login: t("login.submit"),
            }}
          />
        </div>
      </div>
    </main>
  );
}
