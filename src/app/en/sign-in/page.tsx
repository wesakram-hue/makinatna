export const dynamic = "force-dynamic";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { signIn, signOut } from "@/lib/auth/actions";
import { createServerClient } from "@/lib/supabase/server";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const locale = "en";

export default async function Page({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  const next = searchParams?.next ?? "/en/supplier";
  const error = searchParams?.error ?? "";

  // Server-side auth visibility (ensures cookies are refreshed)
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "auth.signInTitle")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link className="underline" href="/en">
            {t(locale, "nav.home")}
          </Link>
          <Link className="underline" href="/ar/sign-in">
            {t(locale, "nav.switchToArabic")}
          </Link>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Sign-in failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {user ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Already signed in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              Signed in as <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href={next}>Continue</Link>
              </Button>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <Button type="submit" variant="outline">
                  {t(locale, "auth.signOut")}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Server auth status: <span className="font-medium">Signed in</span>
          </CardFooter>
        </Card>
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{t(locale, "auth.signInTitle")}</CardTitle>
          </CardHeader>

          <CardContent>
            <form action={signIn} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={next} />

              <div className="space-y-2">
                <Label htmlFor="email">{t(locale, "auth.email")}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t(locale, "auth.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit">{t(locale, "auth.signIn")}</Button>

              <div>
                <Link href={`/${locale}/reset-password`} className="text-sm underline">
                  {t(locale, "auth.forgotPassword")}
                </Link>
              </div>
            </form>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground">
            Server auth status: <span className="font-medium">Signed out</span>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
