# Current State (Single Source of Truth)
Last updated: 2026-01-12

## What we are building
Makinatna is a WhatsApp-first procurement marketplace for construction equipment/services in KSA. Buyers submit RFQs, suppliers submit offers, buyers award jobs, and the platform generates deal artifacts and tracks execution.

## MVP spine (frozen)
RFQ → Offers → Award → Deal Pack → Execution tracking (status + maintenance + Tier-1 telemetry)

## MVP non-goals (explicit)
- No escrow / online checkout in MVP
- No public supplier pages that reveal contact details or allow easy bypass
- No reviews/ratings in MVP
- No OEM telematics integrations (Tier 2)

## B2 requirements
- Full bilingual AR/EN
- True RTL layout on /ar
- Core flows bilingual: Buyer RFQ, Supplier offers, Admin verification, Deal pack templates

## Timeline target
Start: 2026-01-12  
MVP-B2 demo-ready: 2026-03-22

## Current decisions (locked)
- Model pattern: MYCRANE-style procurement spine (RFQ/offers/award/docs) with selective DOZR learnings later
- WhatsApp-first for intake + coordination; app is source of truth
- Anti-bypass: deal artifacts + verification + audit trail; no public contact leakage

## Next steps (this week)
- Set up i18n routing (/en, /ar) and RTL-safe layout
- Implement schema + RLS primitives for the spine
- Commit docs + templates + CI
