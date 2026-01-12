# Model Freeze — MVP-B2 (Procurement/RFQ Spine)
Version: v1.2
Date: 2026-01-12
Status: FROZEN (changes require ADR)

## 1) One-line definition
Makinatna is a WhatsApp-first procurement marketplace for construction equipment/services in KSA that turns job requests into structured RFQs, collects supplier offers, produces deal-critical documentation, and tracks execution (status + maintenance + basic telemetry).

## 2) Core loop (non-negotiable)
RFQ → Matching → Offers → Comparison → Award → Deal Pack → In-Progress tracking → Completion docs → (later) payout/commission

## 3) Primary users
- Buyer (contractor/site manager)
- Supplier (fleet owner / rental company)
- Admin (verification, moderation, disputes, audit)

## 4) State machine (frozen)
### RFQ
Draft → Submitted → OffersOpen → Awarded | Cancelled

### Offer
Draft → Submitted → Accepted | Rejected | Withdrawn

### Job
Confirmed → Mobilising → OnSite → Completed | Disputed | Cancelled

## 5) Monetisation (mechanism frozen; % flexible)
- Supplier-side success fee on awarded jobs
- Optional value-add fees later (transport coordination, compliance pack, guarantee)
- No escrow/checkout in MVP (commission tracking still implemented)

## 6) Anti-bypass (must be built into workflow)
Deal-critical value must be produced by platform:
- Deal Pack: bilingual quote + terms + inclusions + mobilisation checklist + completion proof template
- Verification + ranking: verified suppliers rank higher; buyers trust them
- Audit trail: key actions logged for disputes
- WhatsApp deep-linking with reference codes: every coordination message starts with RFQ/job code

Hard rule: no public supplier pages revealing contact details in MVP.

## 7) Comms model (WhatsApp-first)
- App is source of truth (threads, offers, award, documents)
- WhatsApp is engagement layer via click-to-WhatsApp + reference code
- Email is minimal (auth + critical confirmations + exporting docs)

WhatsApp Business API automation is Phase 2 once volume justifies costs.

## 8) Arabic/English (B2 requirement)
- Routes: /ar and /en
- RTL on /ar
- Bilingual strings and templates for all core flows

## 9) Telematics + maintenance (MVP)
- Telematics Tier 0: manual hours updates
- Telematics Tier 1: driver ping link updates GPS + optional hours
- Maintenance: plans, due/overdue tasks, service logs
- Maintenance compliance signals can boost ranking

## 10) Explicit non-goals (MVP)
- Escrow/online checkout
- Reviews/ratings
- Dynamic pricing optimisation
- ERP integrations
- OEM telematics (Tier 2)
- Public supplier directories/pages that enable bypass

## 11) Data primitives (minimum schema)
- orgs, members, roles
- suppliers (org profile), buyers (org profile)
- assets (fleet), media, regions
- rfqs, rfq_attachments
- offers, offer_line_items
- jobs, job_status_events, job_documents
- messages (canonical log)
- audit_log
- maintenance_plans, maintenance_tasks, service_logs
- telemetry_events, asset_last_state

## 12) Change control
Any change to sections 2–11 requires an ADR in docs/adr/.
