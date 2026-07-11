# Cadenzia Portal — Architecture

## Overview

Client-facing portal for the Cadenzia financial reconciliation service.
Lives at `app.cadenzia.com.br`. Separate repo and deploy from the marketing site (`cadenzia.com.br`).

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Data / Auth | Supabase (Postgres + Auth + RLS) |
| Charts | Recharts |
| Hosting | TBD (Vercel recommended) |

## Data flow

```
Bank statements (Google Drive)
        │
        ▼
       n8n  — ingests, sorts by card terminal serial, reconciles
        │
        ▼
    Supabase  — single source of truth
        │              │
        ▼              ▼
   Appsmith        This portal
  (internal ops)  (client-facing, read + light write)
```

## Auth model

**Per-partner login.** Each partner has their own Supabase Auth account.
Row-Level Security (RLS) policies scope every query to that partner's `client_id` + `partner_id` automatically — no application-layer filtering needed.

There is no shared/admin login for the portal. Clinic-wide admin operations remain in Appsmith.

## Multi-tenancy

- `client_id` is a first-class FK on every table, even with a single client today.
- URL routing is flat (`/dashboard`, `/approvals`). The logged-in user's `client_id` determines what they see via RLS — not the URL.
- Adding a new client = create a Supabase Auth user, insert a partner row, no code changes needed.

## Brand

See `src/styles/tokens.css` for all CSS custom properties.
Key constraint: `--isotonic` (#DDFF55) is used on **one element per screen** — the primary CTA or the single most important live number. Never decorative.

## Open decisions

- [ ] Supabase schema design (clients, partners, transactions, installments, pending_approvals, bank_accounts)
- [ ] RLS policies
- [ ] Hosting / deploy pipeline
- [ ] Vector logo files from designer
- [ ] Font choices confirmation (currently: Manrope + Fraunces italic)
