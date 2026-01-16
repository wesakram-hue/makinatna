import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import BidiText from "@/components/BidiText";
import { formatCurrency } from "@/lib/format";
import { isUuid } from "@/lib/uuid";

type PublicListingRow = {
  id: string;
  slug: string | null;
  title_en: string | null;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  daily_rate: number | string | null;
  currency: string | null;
  published_at: string | null;
  supplier_display_name: string | null;
  supplier_city: string | null;
};

type ImgRow = {
  id: string;
  url: string;
  alt_en: string | null;
  alt_ar: string | null;
  sort_order: number;
  is_primary: boolean;
};

const locale = "ar";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const isId = isUuid(slug);

  const baseSelect =
    "id,slug,title_en,title_ar,description_en,description_ar,daily_rate,currency,published_at,supplier_display_name,supplier_city";

  const q = supabase.from("public_listings").select(baseSelect).limit(1);

  const { data: listing, error } = isId
    ? await q.eq("id", slug).maybeSingle()
    : await q.eq("slug", slug).maybeSingle();

  if (error) throw new Error(error.message);
  if (!listing) notFound();

  const l = listing as PublicListingRow;

  const { data: images } = await supabase
    .from("listing_images")
    .select("id,url,alt_en,alt_ar,sort_order,is_primary")
    .eq("listing_id", l.id)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(12);

  const imgs = (images ?? []) as ImgRow[];

  const title =
    [l.title_ar, l.title_en].find((v) => (v ?? "").trim().length > 0)?.trim() ||
    t(locale, "listing.untitled");

  const description = l.description_ar || l.description_en || "";
  const supplier = (l.supplier_display_name ?? "").trim() || t(locale, "listings.supplier");
  const city = (l.supplier_city ?? "").trim();
  const dailyRate = l.daily_rate == null ? null : Number(l.daily_rate);

  const price =
    dailyRate != null && Number.isFinite(dailyRate)
      ? formatCurrency(locale, dailyRate, l.currency ?? "SAR")
      : null;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            <BidiText>{title}</BidiText>
          </h1>
          <div className="text-sm text-muted-foreground">
            {t(locale, "listings.supplier")}: <BidiText>{supplier}</BidiText>
            {city ? (
              <>
                {" "}
                · {t(locale, "listings.city")}: <BidiText>{city}</BidiText>
              </>
            ) : null}
          </div>
          {price ? (
            <div className="text-sm font-medium">
              <span dir="ltr" className="tabular-nums">
                {price}
              </span>{" "}
              · {t(locale, "listings.pricePerDay")}
            </div>
          ) : null}
        </div>

        <Link className="underline text-sm" href={`/${locale}/listings`}>
          {t(locale, "nav.listings")}
        </Link>
      </div>

      {imgs.length ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {imgs.map((img) => (
            <div key={img.id} className="rounded-lg border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_ar ?? "صورة الإعلان"}
                className="w-full h-56 object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {description ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-sm whitespace-pre-wrap">
            <BidiText>{description}</BidiText>
          </div>
        </div>
      ) : null}
    </main>
  );
}
