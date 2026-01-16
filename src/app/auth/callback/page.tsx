import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Page() {
  return (
    <Suspense
      fallback={<main className="p-6 text-sm text-muted-foreground">Signing you in...</main>}
    >
      <CallbackClient />
    </Suspense>
  );
}
