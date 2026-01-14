import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function safeNext(v: string | null) {
  if (!v) return "/en/supplier";
  if (!v.startsWith("/") || v.startsWith("//")) return "/en/supplier";
  return v;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  const dest = new URL(next, url.origin);
  if (error) dest.searchParams.set("error", error.message);

  return NextResponse.redirect(dest);
}
