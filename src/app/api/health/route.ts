import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        status: 500,
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: anon,
      },
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      const host = new URL(url).host;
      return NextResponse.json({
        ok: true,
        supabaseUrlHost: host,
        auth: {
          name: data?.name ?? null,
          version: data?.version ?? null,
        },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: data?.error ?? "Supabase auth health check failed",
        status: res.status,
      },
      { status: 500 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        status: 500,
      },
      { status: 500 }
    );
  }
}
