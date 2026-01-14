import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createServerClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData.user;

  let role: string | null = null;
  let roleErr: string | null = null;

  if (user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) roleErr = error.message;
    role = profile?.role ?? null;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Debug Auth</h1>
        <div className="flex gap-3 text-sm">
          <Link className="underline" href="/en/sign-in">
            Sign in
          </Link>
          <Link className="underline" href="/en/supplier">
            Supplier
          </Link>
        </div>
      </div>

      <div className="rounded border p-4 text-sm space-y-2">
        <div>
          <strong>User:</strong> {user ? user.email : "null"}
        </div>
        <div>
          <strong>User error:</strong> {userErr?.message ?? "none"}
        </div>
        <div>
          <strong>Role:</strong> {role ?? "null"}
        </div>
        <div>
          <strong>Role error:</strong> {roleErr ?? "none"}
        </div>
      </div>
    </main>
  );
}
