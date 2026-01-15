import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

const locale = "en";

export default async function Page() {
  await requireSupplierPortal(locale);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t(locale, "supplier.newListingTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t(locale, "supplier.newListingDesc")}</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t(locale, "supplier.listingTitleLabel")}</Label>
            <Input id="title" placeholder={t(locale, "supplier.listingTitlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t(locale, "supplier.listingDescriptionLabel")}</Label>
            <Textarea
              id="description"
              placeholder={t(locale, "supplier.listingDescriptionPlaceholder")}
              rows={4}
            />
          </div>
          <Button disabled>{t(locale, "supplier.saveDraft")}</Button>
        </div>
      </Card>
    </div>
  );
}
