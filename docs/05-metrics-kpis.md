# Metrics & KPIs (Instrument from Day 1)

## Funnel metrics
- RFQ created
- RFQ sent to suppliers
- RFQ received ≥1 offer (Offer rate)
- Time to first offer
- Offers per RFQ
- RFQ awarded (Award rate)
- Job completed (Completion rate)

## Supplier performance
- Response SLA compliance (e.g., first response < X minutes/hours)
- Win rate (awarded/offers)
- Cancellation rate
- Maintenance compliance score (assets overdue %)

## Quality / trust
- Verified supplier ratio
- Dispute rate
- Completion doc rate (% jobs with completion proof)

## Unit economics (later)
- Revenue per completed job
- CAC (if paid marketing)
- Supplier acquisition cost
- Take rate by category

## Events to capture (PostHog)
- rfq_created
- rfq_submitted
- supplier_invited_to_rfq
- offer_submitted
- offer_viewed
- rfq_awarded
- job_status_changed
- deal_pack_generated
- telemetry_ping_received
- maintenance_task_completed
