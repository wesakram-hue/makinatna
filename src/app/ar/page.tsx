import Link from "next/link";
import { t } from "@/lib/i18n";

const locale = "ar";

export default function Page() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "app.name")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/ar/supplier" className="underline">
            {t(locale, "nav.supplierPortal")}
          </Link>
          <Link href="/ar/listings" className="underline">
            {t(locale, "nav.listings")}
          </Link>
          <Link href="/ar/sign-in" className="underline">
            {t(locale, "auth.signIn")}
          </Link>
          <Link href="/ar/register" className="underline">
            {t(locale, "auth.signUp")}
          </Link>
          <Link href="/en" className="underline">
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      <p className="mt-3 text-muted-foreground">
        {t(locale, "home.subtitle")}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <Link href="/ar/listings" className="underline">
          {t(locale, "nav.listings")}
        </Link>
        <Link href="/ar/supplier" className="underline">
          {t(locale, "nav.supplierPortal")}
        </Link>
        <Link href="/ar/sign-in" className="underline">
          {t(locale, "auth.signIn")}
        </Link>
        <Link href="/ar/register" className="underline">
          {t(locale, "auth.signUp")}
        </Link>
      </div>
    </main>
  );
}
