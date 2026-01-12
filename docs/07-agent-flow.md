# Agent Flow (Solo Build Discipline)

## Purpose
Prevent U-turns and missed details by forcing every feature to be specified across key lenses.

## Agent lenses (labels)
- agent:product
- agent:architect
- agent:frontend-rtl
- agent:backend-rls
- agent:ops-n8n
- agent:qa
- agent:arabic

## The 5-agent gate (required for core spine features)
Every core feature issue must include:
1) Product outcome + acceptance criteria
2) Architecture/data touchpoints (tables/APIs/RLS/jobs)
3) Arabic/RTL considerations (copy, layout, formatting)
4) Implementation plan (files touched)
5) QA + Telemetry (tests/events/error capture)

## Glossary rule
Do not improvise Arabic terminology in code. Use translation keys and update the glossary consistently.

## Change control rule
Any change to docs/01-model-freeze.md requires an ADR in docs/adr/ before merging.

## Weekly cadence
- Monday: choose Week milestone issues
- Daily: limit to 1–2 core spine tasks at a time
- Friday: demo in /en and /ar for at least one full user story
