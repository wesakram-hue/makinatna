import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { createListingDraft } from "@/lib/actions/listings";

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id,display_name,city")
    .eq("owner_id", user.id)
    .maybeSingle();

  const supplierIncomplete =
    !supplier?.id || !supplier.display_name || supplier.display_name.trim().length === 0 || !supplier.city;

  const error = searchParams?.error ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t(locale, "supplier.newListingNav")}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, "supplier.newListingDesc")}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/ar/supplier/listings">{t(locale, "supplier.myListingsNav")}</Link>
        </Button>
      </div>

      {supplierIncomplete ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {t(locale, "supplier.profileIncomplete")}{" "}
          <Link href="/ar/supplier/profile" className="underline">
            {t(locale, "supplier.profileNav")}
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error === "missing_title" ? "يرجى إضافة عنوان (إنجليزي أو عربي)." : error}
        </div>
      ) : null}

      <Card className="p-4">
        <form action={createListingDraft} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title_ar">{t(locale, "supplier.listingTitleLabel")} (AR)</Label>
              <Input id="title_ar" name="title_ar" placeholder={t(locale, "supplier.listingTitlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">{t(locale, "supplier.listingTitleLabel")} (EN)</Label>
              <Input id="title_en" name="title_en" placeholder="e.g. 50kVA Generator" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="daily_rate">{t(locale, "supplier.dailyRateLabel")}</Label>
              <Input
                id="daily_rate"
                name="daily_rate"
                inputMode="decimal"
                placeholder={t(locale, "supplier.dailyRatePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t(locale, "supplier.currencyLabel")}</Label>
              <Input id="currency" name="currency" defaultValue="SAR" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description_ar">{t(locale, "supplier.listingDescriptionLabel")} (AR)</Label>
              <Textarea
                id="description_ar"
                name="description_ar"
                placeholder={t(locale, "supplier.listingDescriptionPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{t(locale, "supplier.listingDescriptionLabel")} (EN)</Label>
              <Textarea id="description_en" name="description_en" placeholder="Short description..." />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{t(locale, "supplier.saveDraft")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
