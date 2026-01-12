import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RTL Smoke Test</h1>
        <Link href="/en" className="underline">
          Back to English
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">Paragraph</h2>
          <p className="text-muted-foreground">
            This page helps confirm RTL/LTR alignment across common UI elements.
            Check spacing, punctuation, and baseline alignment as you scan the
            content.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">Details</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Lists and bullets align correctly.</li>
            <li>Numbers and labels keep consistent spacing.</li>
            <li>Inline icons or markers sit on the baseline.</li>
            <li>Text blocks wrap without clipping.</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">Form</h2>
          <label className="block text-sm font-medium" htmlFor="name">
            Contact name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter a name"
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Submit
          </button>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">Stats</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">RFQs</div>
              <div className="text-lg font-semibold">18</div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">Offers</div>
              <div className="text-lg font-semibold">27</div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">Jobs</div>
              <div className="text-lg font-semibold">9</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">Key Values</h2>
          <div className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">Acme Corp</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium">Atlas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">In review</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
