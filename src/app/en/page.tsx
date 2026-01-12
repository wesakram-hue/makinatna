import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Makinatna</h1>
        <Link href="/ar" className="underline">
          العربية
        </Link>
      </div>

      <p className="mt-3 text-muted-foreground">
        Welcome to our site. Explore our projects and updates.
      </p>
    </main>
  );
}
