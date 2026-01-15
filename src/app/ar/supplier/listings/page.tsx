import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

const locale = "ar";

export default async function Page() {
  await requireSupplierPortal(locale);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t(locale, "supplier.listingsTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t(locale, "supplier.listingsDesc")}</p>
        </div>
        <Button asChild>
          <Link href="/ar/supplier/listings/new">{t(locale, "supplier.newListingNav")}</Link>
        </Button>
      </div>

      <Card className="p-6 text-sm text-muted-foreground">
        {t(locale, "supplier.listingsEmpty")}
      </Card>
    </div>
  );
}
