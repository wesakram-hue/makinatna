\# Project Rules - AI Assistant Instructions



\## Tech Stack

\- Next.js 16 with App Router

\- React 19

\- TypeScript (strict)

\- Tailwind CSS

\- Sanity CMS + Sanity App SDK

\- Supabase (Auth + Postgres)



---



\## NEXT.JS RULES

1\. Default to Server Components — do not add "use client" unless required for hooks/handlers.

2\. Server Components can: fetch data with async/await, use cookies/headers, access backend directly.

3\. Client Components required for: useState, useEffect, event handlers, browser APIs.

4\. Prefer Server Actions for mutations — avoid API routes unless required for third-party callbacks.

5\. Route groups with (parentheses) do not affect URL paths.



---



\## TYPESCRIPT RULES

1\. Never use `any` — define proper types/interfaces.

2\. Define types before implementation.

3\. If unknown, use `unknown` + type guards — do not guess with `any`.

4\. Reuse shared types/utilities — do not duplicate.



---



\## SANITY CMS RULES (CRITICAL)

\- Use `sanityFetch`, not `client.fetch`.

\- Wrap GROQ in `defineQuery`.

\- Use projections for references.

\- After schema/query changes run: `pnpm typegen`.



---



\## SANITY APP SDK RULES

1\. Everything in /admin routes = client components.

2\. Use hooks (useDocuments/useEditDocument) rather than fetch.

3\. Wrap in Suspense with loading fallbacks.

4\. Disable SSR for App SDK provider using dynamic import with `ssr: false`.



---



\## CODE ORGANISATION

\- Constants: `/src/lib/constants.ts`

\- Types: `/src/types/...`

\- Sanity queries: `/src/sanity/queries/...`

\- Server actions: `/src/lib/actions/...`

\- Components: `/src/components/...`



Do not duplicate constants, types, or utilities — import existing ones.



---



\## AUTH + SUPABASE RULES (IMPORTANT)

1\. All cookie/header runtime quirks must be handled ONLY in:

&nbsp;  - `src/lib/supabase/server.ts`

&nbsp;  Do not re-implement cookie parsing elsewhere.

2\. Server-side auth pages must use the shared `createServerClient()` only.

3\. Avoid adding new auth routes unless necessary. Prefer server actions + existing auth flow.



---



\## DO NOT

\- ❌ Add "use client" without requirement

\- ❌ Use `any`

\- ❌ Use `client.fetch()` instead of `sanityFetch()`

\- ❌ Write GROQ queries without `defineQuery()`

\- ❌ Duplicate utilities/types/constants

\- ❌ Build API routes when server actions work



