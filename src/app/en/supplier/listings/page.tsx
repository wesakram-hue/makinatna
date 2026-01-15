import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { localizeText } from "@/lib/localize";
import { formatCurrency } from "@/lib/format";
import BidiText from "@/components/BidiText";
import { setListingStatus } from "@/app/actions/listings";

type ListingRow = {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  daily_rate: number | null;
  currency: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string | null;
};

const locale = "en";

export default async function Page({
  searchParams,
}: {
  searchParams?: { created?: string };
}) {
  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: supplier, error: supplierErr } = await supabase
    .from("suppliers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (supplierErr) {
    throw new Error(supplierErr.message);
  }

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t(locale, "supplier.myListingsNav")}</h1>
            <p className="text-sm text-muted-foreground">{t(locale, "supplier.listingsDesc")}</p>
          </div>
          <Button asChild>
            <Link href="/en/supplier/start">{t(locale, "supplier.startTitle")}</Link>
          </Button>
        </div>
        <div className="rounded border border-border bg-muted/30 p-6 text-sm">
          {t(locale, "supplier.profileMissing")}
        </div>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("listings")
    .select("id,title_en,title_ar,daily_rate,currency,status,published_at,created_at")
    .eq("supplier_id", supplier.id)
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as ListingRow[];
  const created = searchParams?.created === "1";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t(locale, "supplier.myListingsNav")}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, "supplier.listingsDesc")}</p>
        </div>
        <Button asChild>
          <Link href="/en/supplier/listings/new">{t(locale, "supplier.addListing")}</Link>
        </Button>
      </div>

      {created ? (
        <div className="rounded border border-border bg-muted/30 p-3 text-sm">
          {t(locale, "supplier.createdListing")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded border border-border bg-muted/30 p-6 text-sm">
          {t(locale, "supplier.listingsEmpty")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const titleText = localizeText(locale, l.title_en, l.title_ar).trim();
            const title = titleText || t(locale, "listing.untitled");
            const status = l.status;
            const isPublished = status === "published";

            const statusLabel =
              status === "published"
                ? t(locale, "supplier.statusPublished")
                : status === "archived"
                  ? "Archived"
                  : t(locale, "supplier.statusDraft");

            const price =
              l.daily_rate != null && Number.isFinite(l.daily_rate)
                ? formatCurrency(locale, l.daily_rate, l.currency ?? "SAR")
                : null;

            return (
              <Card key={l.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    <BidiText>{title}</BidiText>
                  </div>
                  <span className="text-xs rounded border px-2 py-1 text-muted-foreground">
                    {statusLabel}
                  </span>
                </div>

                {price ? (
                  <div className="text-sm font-medium">
                    <span className="tabular-nums">{price}</span> · {t(locale, "listings.pricePerDay")}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}

                <div className="pt-2 flex items-center justify-between gap-2 text-sm">
                  <Link className="underline" href={`/en/supplier/listings/${l.id}`}>
                    View
                  </Link>

  <form action={setListingStatus.bind(null, locale, l.id, isPublished ? "draft" : "published")}>
    <Button type="submit" variant="secondary" size="sm">
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
