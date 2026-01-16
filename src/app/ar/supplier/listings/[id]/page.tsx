import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { localizeText } from "@/lib/localize";
import { formatCurrency } from "@/lib/format";
import BidiText from "@/components/BidiText";
import { isUuid } from "@/lib/uuid";
import { setListingStatus } from "@/app/actions/listings";
import {
  addListingImage,
  deleteListingImage,
  setPrimaryListingImage,
} from "@/app/actions/listing-images";

const locale = "ar";

type ImgRow = {
  id: string;
  url: string;
  alt_en: string | null;
  alt_ar: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select(
      "id,slug,supplier_id,status,title_en,title_ar,description_en,description_ar,daily_rate,weekly_rate,currency,published_at,created_at,updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (listingErr) throw new Error(listingErr.message);
  if (!listing) notFound();

  const { data: supplier, error: supplierErr } = await supabase
    .from("suppliers")
    .select("id,owner_id,display_name,city")
    .eq("id", listing.supplier_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (supplierErr) throw new Error(supplierErr.message);
  if (!supplier) notFound();

  const { data: images } = await supabase
    .from("listing_images")
    .select("id,url,alt_en,alt_ar,sort_order,is_primary,created_at")
    .eq("listing_id", listing.id)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const imgs = (images ?? []) as ImgRow[];

  const titleText = localizeText(locale, listing.title_en, listing.title_ar).trim();
  const title = titleText || t(locale, "listing.untitled");
  const isPublished = listing.status === "published";
  const description = listing.description_ar || listing.description_en || "";
  const supplierName = supplier.display_name ?? "";
  const supplierCity = supplier.city ?? "";

  return (
    <main className="p-6 space-y-4">
      <div className="text-sm text-muted-foreground">
        المورّد: {supplierName ?? ""} ، المدينة: {supplierCity ?? ""}
      </div>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              <BidiText>{title}</BidiText>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs rounded border px-2 py-1 text-muted-foreground">
                {isPublished ? t(locale, "supplier.statusPublished") : t(locale, "supplier.statusDraft")}
              </span>
              <Link className="text-sm underline" href="/ar/supplier/listings">
                {t(locale, "supplier.myListingsNav")}
              </Link>
              {isPublished && listing.slug ? (
                <Link className="text-sm underline" href={`/ar/listings/${listing.slug}`}>
                  الصفحة العامة
                </Link>
              ) : null}
            </div>
          </div>

          <form
            action={setListingStatus.bind(null, locale, listing.id, isPublished ? "draft" : "published")}
            className="flex items-center gap-2"
          >
            <Button type="submit" variant={isPublished ? "secondary" : "default"}>
              {isPublished ? "إلغاء النشر" : "نشر"}
            </Button>
          </form>
        </div>

        <Card className="p-4 space-y-3">
          <div className="font-semibold">التفاصيل</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{t(locale, "supplier.status")}:</span>{" "}
              {isPublished ? t(locale, "supplier.statusPublished") : t(locale, "supplier.statusDraft")}
            </div>
            <div>
              <span className="font-medium text-foreground">{t(locale, "supplier.dailyRateLabel")}:</span>{" "}
              {listing.daily_rate != null && Number.isFinite(Number(listing.daily_rate))
                ? `${formatCurrency(locale, Number(listing.daily_rate), listing.currency ?? "SAR")}`
                : "—"}
            </div>
            <div>
              <span className="font-medium text-foreground">المورّد:</span>{" "}
              <BidiText>{supplierName || t(locale, "listings.supplier")}</BidiText>
            </div>
            <div>
              <span className="font-medium text-foreground">{t(locale, "listings.city")}:</span>{" "}
              <BidiText>{supplierCity || "—"}</BidiText>
            </div>
            {description ? (
              <div className="pt-2">
                <div className="font-medium text-foreground mb-1">{t(locale, "supplier.listingDescriptionLabel")}</div>
                <div className="whitespace-pre-wrap text-foreground">{description}</div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card id="images" className="p-4 space-y-3">
          <div className="font-semibold">الصور</div>

          <div className="text-sm text-muted-foreground">
            أضف روابط الصور حالياً. يمكننا التحول إلى رفع الملفات عبر التخزين لاحقاً بدون تغيير قاعدة البيانات.
          </div>

          <form action={addListingImage} className="grid gap-3 md:grid-cols-6 items-end">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="listing_id" value={listing.id} />

            <div className="md:col-span-3">
              <label className="text-sm">رابط الصورة</label>
              <input
                name="url"
                required
                placeholder="https://..."
                className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-sm">الترتيب</label>
              <input
                name="sort_order"
                defaultValue="0"
                className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-sm">صورة رئيسية</label>
              <div className="mt-2 flex items-center gap-2">
                <input id="is_primary" type="checkbox" name="is_primary" value="1" />
                <label htmlFor="is_primary" className="text-sm text-muted-foreground">
                  تعيين
                </label>
              </div>
            </div>

            <div className="md:col-span-1">
              <Button type="submit" className="w-full">
                إضافة
              </Button>
            </div>
          </form>

          {imgs.length === 0 ? (
            <div className="rounded border border-border bg-muted/30 p-4 text-sm">لا توجد صور بعد.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {imgs.map((img) => (
                <Card key={img.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs rounded border px-2 py-1 text-muted-foreground">
                      {img.is_primary ? "صورة رئيسية" : "صورة"}
                    </span>
                    <div className="flex items-center gap-2">
                      {!img.is_primary ? (
                        <form action={setPrimaryListingImage}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input type="hidden" name="image_id" value={img.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            جعلها رئيسية
                          </Button>
                        </form>
                      ) : null}

                      <form action={deleteListingImage}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="listing_id" value={listing.id} />
                        <input type="hidden" name="image_id" value={img.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          حذف
                        </Button>
                      </form>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt_ar ?? "صورة الإعلان"}
                    className="w-full rounded border border-border object-cover"
                  />
                  <div className="text-xs text-muted-foreground break-all">{img.url}</div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}




