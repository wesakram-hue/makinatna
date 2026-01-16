import Link from "next/link";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";
import { registerUser } from "@/lib/auth/actions";

const locale = "ar";

type SearchParams = { next?: string; error?: string; sent?: string; asSupplier?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) redirect("/ar/supplier");

  const sp = (await searchParams) ?? {};
  const next = sp.next ?? "/ar/listings";
  const error = sp.error ?? "";
  const sent = sp.sent === "1";
  const asSupplierParam = sp.asSupplier === "1";
  const defaultAsSupplier = asSupplierParam || next.startsWith("/ar/supplier");

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "auth.registerTitle")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link className="underline" href="/ar">
            {t(locale, "nav.home")}
          </Link>
          <Link className="underline" href="/en/register">
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {sent ? (
        <div className="rounded border border-border bg-muted/30 p-4 text-sm">
          {t(locale, "auth.checkEmail")}{" "}
          <Link className="underline" href={`/ar/sign-in?next=${encodeURIComponent(next)}`}>
            {t(locale, "auth.signIn")}
          </Link>
        </div>
      ) : null}

      <form action={registerUser} className="space-y-4 max-w-xl">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="email">
            {t(locale, "auth.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">
            {t(locale, "auth.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="as_supplier"
            value="1"
            defaultChecked={defaultAsSupplier}
            className="mt-1 h-4 w-4 rounded border border-input"
          />
          <span>
            <span className="font-medium">{t(locale, "auth.registerAsSupplier")}</span>
            <span className="block text-muted-foreground">
              {t(locale, "auth.registerAsSupplierHint")}
            </span>
          </span>
        </label>

        <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t(locale, "auth.signUp")}
        </button>

        <div className="text-sm">
          {t(locale, "auth.haveAccount")}{" "}
          <Link href="/ar/sign-in" className="underline">
            {t(locale, "auth.signIn")}
          </Link>
        </div>
      </form>
    </main>
  );
}
