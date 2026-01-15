import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { signOut } from "@/lib/auth/actions";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

const locale = "ar";

export default async function Page() {
  await requireSupplierPortal(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t(locale, "supplier.settingsTitle")}</h1>
      <Card className="p-4 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Link className="underline" href="/ar/update-password">
            {t(locale, "auth.updatePassword")}
          </Link>
        </div>
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="destructive" size="sm">
            {t(locale, "auth.signOut")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
