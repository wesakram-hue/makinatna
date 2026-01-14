export const dynamic = "force-dynamic";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { signOut } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/requireRole";

const locale = "ar";

export default async function Page() {
  const { user } = await requireRole(locale, "/ar/supplier", ["supplier", "admin"]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.title")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/ar" className="underline">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/ar/listings" className="underline">
            {t(locale, "nav.listings")}
          </Link>
          <Link href="/en/supplier" className="underline">
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        {user.email ? (
          <>
            {t(locale, "supplier.signedInAs")}{" "}
            <span dir="ltr" className="font-medium">
              {user.email}
            </span>
          </>
        ) : null}
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
