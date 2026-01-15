import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

const locale = "en";

export default async function Page() {
  const { supabase, user, role } = await requireSupplierPortal(locale);

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id,display_name,city")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { count: listingsCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const supplierIncomplete =
    !supplier?.id || !supplier.display_name || supplier.display_name.trim().length === 0 || !supplier.city;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.dashboardTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t(locale, "supplier.dashboardDesc")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <div className="font-semibold">{t(locale, "supplier.quickActions")}</div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/en/supplier/listings/new">{t(locale, "supplier.addListing")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/en/supplier/listings">{t(locale, "supplier.myListingsNav")}</Link>
            </Button>
          </div>
          {supplierIncomplete ? (
            <div className="text-sm text-destructive">
              {t(locale, "supplier.profileIncomplete")}{" "}
              <Link href="/en/supplier/profile" className="underline">
                {t(locale, "supplier.profileNav")}
              </Link>
            </div>
          ) : null}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="font-semibold">{t(locale, "supplier.listingsHealth")}</div>
          <div className="text-sm text-muted-foreground">
            {t(locale, "supplier.totalListings", { count: listingsCount ?? 0 })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 space-y-1">
          <div className="font-semibold">{t(locale, "supplier.trustReadiness")}</div>
          <div className="text-sm">
            {t(locale, "supplier.roleLabel")}: <span className="font-medium">{role}</span>
          </div>
          <div className="text-sm">
            {t(locale, "supplier.hasSupplierRow")}:{" "}
            <span className="font-medium">{supplier?.id ? t(locale, "supplier.yes") : t(locale, "supplier.no")}</span>
          </div>
          <div className="text-sm">
            {t(locale, "supplier.cityPresent")}:{" "}
            <span className="font-medium">
              {supplier?.city ? t(locale, "supplier.yes") : t(locale, "supplier.no")}
            </span>
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-semibold">{t(locale, "supplier.comingSoonEnquiries")}</div>
          <div className="text-sm text-muted-foreground">{t(locale, "supplier.comingSoon")}</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-semibold">{t(locale, "supplier.comingSoonRFQ")}</div>
          <div className="text-sm text-muted-foreground">{t(locale, "supplier.comingSoon")}</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-semibold">{t(locale, "supplier.comingSoonRevenue")}</div>
          <div className="text-sm text-muted-foreground">{t(locale, "supplier.comingSoon")}</div>
        </Card>
      </div>
    </div>
  );
}
