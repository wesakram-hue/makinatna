import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { localizeText } from "@/lib/localize";
import BidiText from "@/components/BidiText";
import { setListingStatus } from "@/app/actions/listings";
import {
  addListingImage,
  deleteListingImage,
  setPrimaryListingImage,
} from "@/app/actions/listing-images";

const locale = "en";

type ImgRow = {
  id: string;
  url: string;
  alt_en: string | null;
  alt_ar: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { created?: string; err?: string; img?: string };
}) {
  const { supabase, user } = await requireSupplierPortal(locale);

  function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  }

  const id = params?.id;
  if (!id || id === "undefined" || !isUuid(id)) {
    redirect(`/${locale}/supplier/listings?err=bad_id`);
  }

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select(
      "id,supplier_id,slug,status,title_en,title_ar,description_en,description_ar,daily_rate,weekly_rate,currency,published_at,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (listingErr) throw new Error(listingErr.message);
  if (!listing) notFound();

  const { data: owns, error: ownErr } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", listing.supplier_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownErr) throw new Error(ownErr.message);
  if (!owns) notFound();

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

  return (
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
            <Link className="text-sm underline" href="/en/supplier/listings">
              {t(locale, "supplier.myListingsNav")}
            </Link>
            {isPublished && listing.slug ? (
              <Link className="text-sm underline" href={`/en/listings/${listing.slug}`}>
                Public page
              </Link>
            ) : null}
          </div>
        </div>

        <form
          action={setListingStatus.bind(null, locale, listing.id, isPublished ? "draft" : "published")}
          className="flex items-center gap-2"
        >
          <Button type="submit" variant={isPublished ? "secondary" : "default"}>
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
        </form>
      </div>

      <Card id="images" className="p-4 space-y-3">
        <div className="font-semibold">Images</div>

        <div className="text-sm text-muted-foreground">
          Add image URLs for now. We can switch to Supabase Storage upload next without changing the database.
        </div>

        <form action={addListingImage} className="grid gap-3 md:grid-cols-6 items-end">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="listing_id" value={listing.id} />

          <div className="md:col-span-3">
            <label className="text-sm">Image URL</label>
            <input
              name="url"
              required
              placeholder="https://..."
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm">Sort</label>
            <input
              name="sort_order"
              defaultValue="0"
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm">Primary</label>
            <div className="mt-2 flex items-center gap-2">
              <input id="is_primary" type="checkbox" name="is_primary" value="1" />
              <label htmlFor="is_primary" className="text-sm text-muted-foreground">
                Set
              </label>
            </div>
          </div>

          <div className="md:col-span-1">
            <Button type="submit" className="w-full">
              Add
            </Button>
          </div>
        </form>

        {imgs.length === 0 ? (
          <div className="rounded border border-border bg-muted/30 p-4 text-sm">No images yet.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {imgs.map((img) => (
              <Card key={img.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs rounded border px-2 py-1 text-muted-foreground">
                    {img.is_primary ? "Primary" : "Image"}
                  </span>
                  <div className="flex items-center gap-2">
                    {!img.is_primary ? (
                      <form action={setPrimaryListingImage}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="listing_id" value={listing.id} />
                        <input type="hidden" name="image_id" value={img.id} />
                        <Button type="submit" variant="secondary" size="sm">
                          Make primary
                        </Button>
                      </form>
                    ) : null}

                    <form action={deleteListingImage}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="image_id" value={img.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>

                <img
                  src={img.url}
                  alt={img.alt_en ?? "Listing image"}
                  className="w-full rounded border border-border object-cover"
                />
                <div className="text-xs text-muted-foreground break-all">{img.url}</div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
