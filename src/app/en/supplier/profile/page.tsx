import Link from "next/link";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

const locale = "en";

export default async function Page() {
  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("display_name,city")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!supplier) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.profileTitle")}</h1>
        <Card className="p-4 text-sm">
          <div className="mb-2">{t(locale, "supplier.profileMissing")}</div>
          <Link href="/en/supplier/start" className="underline">
            {t(locale, "supplier.startTitle")}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t(locale, "supplier.profileTitle")}</h1>
      <Card className="p-4 text-sm space-y-2">
        <div>
          <span className="font-medium">{t(locale, "supplier.displayName")}:</span>{" "}
          {supplier.display_name ?? t(locale, "listing.untitled")}
        </div>
        <div>
          <span className="font-medium">{t(locale, "supplier.city")}:</span>{" "}
          {supplier.city ?? "-"}
        </div>
      </Card>
    </div>
  );
}
