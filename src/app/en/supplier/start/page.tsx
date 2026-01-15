import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import { becomeSupplier } from "@/lib/auth/actions";

const locale = "en";

type Role = "buyer" | "supplier" | "admin";
type SearchParams = { error?: string | string[] };

export default async function SupplierStartPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = await createServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    redirect(`/en/sign-in?next=${encodeURIComponent("/en/supplier/start")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "buyer") as Role;

  // Prevent loop: if already supplier/admin AND supplier row exists -> go to /supplier
  const { data: supplierRow } = await supabase
    .from("suppliers")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  const hasSupplierRow = Boolean(supplierRow?.id);

  if (role === "admin" || (role === "supplier" && hasSupplierRow)) {
    redirect("/en/supplier");
  }

  const e = searchParams?.error;
  const error = Array.isArray(e) ? e[0] : e;

  return (
    <main className="p-6 space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.startTitle")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/en" className="underline">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/ar/supplier/start" className="underline">
            {t(locale, "nav.switchToArabic")}
          </Link>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t(locale, "supplier.startDesc")}</p>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {role === "supplier" && !hasSupplierRow ? (
        <div className="rounded border border-border bg-muted/30 p-3 text-sm">
          Your account role is already <span className="font-medium">supplier</span>, but setup
          isn’t complete yet. Please finish the details below.
        </div>
      ) : null}

      <form action={becomeSupplier} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="display_name">
            {t(locale, "supplier.displayName")}
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="city">
            {t(locale, "supplier.city")}
          </label>
          <input
            id="city"
            name="city"
            placeholder="Riyadh"
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t(locale, "supplier.createAccount")}
        </button>
      </form>
    </main>
  );
}
