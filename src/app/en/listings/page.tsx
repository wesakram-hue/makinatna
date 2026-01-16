import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";
import BidiText from "@/components/BidiText";

type PublicListingRow = {
  id: string;
  slug: string | null;
  title_en: string | null;
  title_ar: string | null;
  daily_rate: number | string | null;
  currency: string | null;
  published_at: string | null;
  supplier_display_name: string | null;
  supplier_city: string | null;
};

const locale = "en";

export default async function ListingsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("public_listings")
    .select(
      "id,slug,title_en,title_ar,daily_rate,currency,published_at,supplier_display_name,supplier_city"
    )
    .order("published_at", { ascending: false })
    .limit(50);

  const listings = (data ?? []) as PublicListingRow[];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "listings.title")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/en" className="underline">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/en/rtl-smoke" className="underline">
            {t(locale, "nav.rtlSmoke")}
          </Link>
          <Link href="/ar/listings" className="underline">
            {t(locale, "nav.switchToArabic")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">{t(locale, "listings.empty")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const title =
              [item.title_en, item.title_ar].find((v) => (v ?? "").trim().length > 0)?.trim() ||
              t(locale, "listing.untitled");
            const city = item.supplier_city ?? "";
            const supplier =
              (item.supplier_display_name ?? "").trim() || t(locale, "listings.supplier");
            const dailyRate = item.daily_rate == null ? null : Number(item.daily_rate);
            const price =
              dailyRate != null && Number.isFinite(dailyRate)
                ? formatCurrency(locale, dailyRate, item.currency ?? "SAR")
                : null;
            const href = item.slug ? `/en/listings/${item.slug}` : `/en/listings/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                className="block rounded-lg border border-border bg-muted/30 p-4 space-y-2 hover:border-ring"
              >
                <h2 className="text-lg font-semibold">
                  <BidiText>{title}</BidiText>
                </h2>
                <div className="text-sm text-muted-foreground">
                  {t(locale, "listings.supplier")}: <BidiText>{supplier}</BidiText>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(locale, "listings.city")}: <BidiText>{city}</BidiText>
                </div>
                {price && (
                  <div className="text-sm font-medium">
                    <span className="tabular-nums">{price}</span> - {t(locale, "listings.pricePerDay")}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
