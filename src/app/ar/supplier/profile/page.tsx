import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { updateSupplierProfile } from "@/lib/actions/supplier";

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string; profile_saved?: string }>;
}) {
  const { supabase, user, role } = await requireSupplierPortal(locale);

  const sp = (await searchParams) ?? {};
  const next = sp.next ?? "/ar/supplier";
  const error = sp.error ?? "";
  const saved = sp.profile_saved === "1";

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id,display_name,city")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (role !== "admin" && !supplier?.id) {
    return (
      <div className="space-y-4">
        <div className="text-sm">لم يتم العثور على ملف مورد. يرجى إكمال الإعداد أولاً.</div>
        <Button asChild>
          <Link href={`/ar/supplier/start?next=${encodeURIComponent(next)}`}>الذهاب للإعداد</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t(locale, "supplier.profileNav")}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, "supplier.profileDesc")}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/ar/supplier">{t(locale, "supplier.dashboardNav")}</Link>
        </Button>
      </div>

      {saved ? (
        <div className="rounded border border-border bg-muted/30 p-3 text-sm">
          {t(locale, "supplier.profileSaved")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error === "missing_name" ? "يرجى إدخال اسم المورد." : error}
        </div>
      ) : null}

      <Card className="p-4">
        <form action={updateSupplierProfile} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={next} />

          <div className="space-y-2">
            <Label htmlFor="display_name">{t(locale, "supplier.displayName")}</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={supplier?.display_name ?? ""}
              placeholder={t(locale, "supplier.displayNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t(locale, "supplier.city")}</Label>
            <Input
              id="city"
              name="city"
              defaultValue={supplier?.city ?? ""}
              placeholder={t(locale, "supplier.cityPlaceholder")}
            />
          </div>

          <Button type="submit">{t(locale, "supplier.saveProfile")}</Button>
        </form>
      </Card>
    </div>
  );
}
