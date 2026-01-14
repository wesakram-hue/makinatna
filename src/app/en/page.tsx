import Link from "next/link";
import { t } from "@/lib/i18n";

const locale = "en";

export default function Page() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "app.name")}</h1>
        <Link href="/ar" className="underline">
          {t(locale, "nav.switchToArabic")}
        </Link>
      </div>

      <p className="mt-3 text-muted-foreground">
        {t(locale, "home.subtitle")}
      </p>

      <div className="mt-4">
        <Link href="/en/listings" className="underline">
          {t(locale, "nav.listings")}
        </Link>
      </div>
    </main>
  );
}
