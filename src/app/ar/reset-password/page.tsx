import Link from "next/link";
import { t } from "@/lib/i18n";
import { sendResetPasswordEmail } from "@/lib/auth/actions";

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const sp = searchParams ? await searchParams : {};
  const e = sp.error;
  const error = Array.isArray(e) ? e[0] : e;
  const sent = sp.sent === "1";

  return (
    <main className="p-6 space-y-6 max-w-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "auth.resetTitle")}</h1>
        <Link href="/ar" className="underline">
          {t(locale, "nav.home")}
        </Link>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {sent ? (
        <div className="rounded border border-border bg-muted/30 p-3 text-sm">
          {t(locale, "auth.resetEmailSent")}
        </div>
      ) : null}

      <form action={sendResetPasswordEmail} className="space-y-3">
        <input type="hidden" name="locale" value={locale} />

        <label className="block text-sm font-medium" htmlFor="email">
          {t(locale, "auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t(locale, "auth.resetTitle")}
        </button>
      </form>
    </main>
  );
}
