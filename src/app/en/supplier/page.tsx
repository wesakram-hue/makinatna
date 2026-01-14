export const dynamic = "force-dynamic";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { signOut } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/requireRole";

const locale = "en";

export default async function Page() {
  const { user } = await requireRole(locale, "/en/supplier", ["supplier", "admin"]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.title")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/en" className="underline">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/en/listings" className="underline">
            {t(locale, "nav.listings")}
          </Link>
          <Link href="/ar/supplier" className="underline">
            {t(locale, "nav.switchToArabic")}
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        {t(locale, "supplier.signedInAs")} <span className="font-medium">{user.email}</span>
      </div>

      <form action={signOut}>
        <input type="hidden" name="locale" value={locale} />
        <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t(locale, "auth.signOut")}
        </button>
      </form>
    </main>
  );
}
