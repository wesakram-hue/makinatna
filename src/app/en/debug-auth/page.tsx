import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function DebugAuthPage() {
  const supabase = await createServerClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData.user;

  let role: string | null = null;
  let supplier: { id: string; display_name: string | null; city: string | null } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = profile?.role ?? null;

    const { data: supplierRow } = await supabase
      .from("suppliers")
      .select("id,display_name,city")
      .eq("owner_id", user.id)
      .maybeSingle();

    supplier = supplierRow ?? null;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Debug Auth</h1>
        <div className="flex gap-3 text-sm">
          <Link className="underline" href="/en">Home</Link>
          <Link className="underline" href="/en/sign-in">Sign in</Link>
          <Link className="underline" href="/en/supplier">Supplier</Link>
        </div>
      </div>

      <div className="rounded border p-4 text-sm space-y-2">
        <div><span className="font-medium">getUser error:</span> {userErr?.message ?? "none"}</div>
        <div><span className="font-medium">user:</span> {user ? user.email : "null"}</div>
        <div><span className="font-medium">user id:</span> {user?.id ?? "null"}</div>
        <div><span className="font-medium">role:</span> {role ?? "null"}</div>
        <div><span className="font-medium">supplier row:</span> {supplier ? JSON.stringify(supplier) : "null"}</div>
      </div>
    </main>
  );
}
