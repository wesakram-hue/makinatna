\# Makinatna Project Rules



\## Overview

This document outlines the rules and guidelines for the Codex/AI assistant in the Makinatna project.



\## Project Stack

\- \*\*Framework:\*\* Next.js App Router (`src/app`)

\- \*\*Internationalization:\*\* Custom i18n using JSON files (`src/messages/en.json`, `src/messages/ar.json`)

\- \*\*Authentication:\*\* Supabase with roles `buyer`, `supplier`, `admin`

\- \*\*UI Components:\*\* shadcn/ui (`src/components/ui`)



\## AI Assistant Rules



1\. \*\*Context Awareness\*\*

&nbsp;  - Always use the current user role (`buyer`, `supplier`, `admin`) to tailor responses.

&nbsp;  - Be aware of the active page or component in `src/app` when suggesting code or content.



2\. \*\*Code Generation\*\*

&nbsp;  - Follow Next.js App Router conventions strictly.

&nbsp;  - Utilize existing i18n JSON structures for any text content.

&nbsp;  - Use shadcn/ui components where applicable.

&nbsp;  - Ensure code aligns with Supabase auth patterns and respects role-based access.



3\. \*\*Responses\*\*

&nbsp;  - Provide concise, actionable suggestions.

&nbsp;  - Highlight potential security or permission issues based on roles.

&nbsp;  - Include code snippets in proper TypeScript/JSX format.



4\. \*\*Best Practices\*\*

&nbsp;  - Maintain code readability and consistency with existing project style.

&nbsp;  - Use `src/messages/en.json` and `ar.json` for all new text.

&nbsp;  - Always consider mobile responsiveness when suggesting UI components.



5\. \*\*Error Handling\*\*

&nbsp;  - Encourage proper error handling for both frontend and Supabase backend operations.

&nbsp;  - Suggest fallback or default behaviors for missing translations or data.



6\. \*\*Collaboration\*\*

&nbsp;  - When suggesting changes, consider the roles of team members.

&nbsp;  - Avoid introducing breaking changes to existing components.



\## Versioning

\- Document reflects the current stack as of 2026-01-17.



