import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">مكيناتنا</h1>
        <Link href="/en" className="underline">
          English
        </Link>
      </div>

      <p className="mt-3 text-muted-foreground">
        مرحبًا بكم في موقعنا. اكتشف مشاريعنا وآخر التحديثات.
      </p>
    </main>
  );
}
