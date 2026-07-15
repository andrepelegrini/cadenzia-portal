-- =============================================================================
-- Cadenzia — Initial Schema
-- Migration: 0001_initial_schema.sql
-- =============================================================================
-- Multi-tenant from day one: every table carries client_id.
-- Auth: Supabase Auth (one user per partner). RLS scopes all queries.
-- =============================================================================


-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ── clients ───────────────────────────────────────────────────────────────────
-- One row per business (clinic, practice, etc.)
create table public.clients (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,                   -- e.g. "Clínica DermaSul"
  cnpj       text unique,                     -- DOCUMENTO field in Stone CSV
  slug       text unique not null,            -- e.g. "dermasul" (URL-safe)
  created_at timestamptz not null default now()
);

comment on table public.clients is
  'One row per business. All other tables reference this via client_id.';


-- ── partners ──────────────────────────────────────────────────────────────────
-- One row per partner/doctor. Links to Supabase Auth via auth_user_id.
create table public.partners (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name         text not null,                 -- e.g. "Ana Souza"
  email        text not null,
  created_at   timestamptz not null default now(),

  unique (client_id, email)
);

comment on table public.partners is
  'One row per partner. auth_user_id links to Supabase Auth for login.';

create index on public.partners (client_id);
create index on public.partners (auth_user_id);


-- ── card_terminals ────────────────────────────────────────────────────────────
-- Maps a Stone card machine (stonecode + serial) to a partner.
-- E-commerce terminals have no serial number and no assigned partner —
-- their transactions go to the approval queue.
create table public.card_terminals (
  id             uuid primary key default uuid_generate_v4(),
  client_id      uuid not null references public.clients(id) on delete cascade,
  partner_id     uuid references public.partners(id) on delete set null,
  stonecode      text not null,               -- STONECODE field (Stone merchant ID)
  serial_number  text,                        -- N DE SERIE (null for E-commerce)
  capture_method text not null                -- 'POS' | 'E-commerce'
                   check (capture_method in ('POS', 'E-commerce')),
  label          text,                        -- friendly name, e.g. "Máquina — Ana"
  created_at     timestamptz not null default now(),

  -- a (stonecode, serial) pair must be unique within a client
  unique (client_id, stonecode, serial_number)
);

comment on table public.card_terminals is
  'Card machines from Stone. POS terminals with a serial are assigned to a partner; '
  'E-commerce terminals (no serial) produce transactions that need manual approval.';

create index on public.card_terminals (client_id);
create index on public.card_terminals (partner_id);


-- ── transactions ──────────────────────────────────────────────────────────────
-- One row per sale from the Stone CSV export.
-- partner_id is set immediately for POS transactions (via terminal lookup);
-- null for E-commerce until manually approved.
create table public.transactions (
  id                   uuid primary key default uuid_generate_v4(),
  client_id            uuid not null references public.clients(id) on delete cascade,
  partner_id           uuid references public.partners(id) on delete set null,
  terminal_id          uuid references public.card_terminals(id) on delete set null,

  -- Stone CSV fields (raw values preserved exactly)
  stone_transaction_id text unique not null,  -- STONE ID
  stonecode            text not null,          -- STONECODE
  sale_date            timestamptz not null,   -- DATA DA VENDA
  card_brand           text,                   -- BANDEIRA (Visa, MasterCard, etc.)
  product              text,                   -- PRODUTO (Credito | Debito)
  installments         int not null default 1, -- N DE PARCELAS
  gross_amount         numeric(12,2) not null, -- VALOR BRUTO
  net_amount           numeric(12,2) not null, -- VALOR LIQUIDO (after fees)
  mdr_discount         numeric(12,2) not null default 0, -- DESCONTO DE MDR
  anticipation_discount numeric(12,2) not null default 0, -- DESCONTO DE ANTECIPACAO
  unified_discount     numeric(12,2) not null default 0,  -- DESCONTO UNIFICADO
  card_last4           text,                   -- last 4 digits of N DO CARTAO
  card_masked          text,                   -- full masked N DO CARTAO (e.g. 545915******4576)
  capture_method       text,                   -- MEIO DE CAPTURA (POS | E-commerce)
  serial_number        text,                   -- N DE SERIE
  stone_status         text,                   -- ULTIMO STATUS (e.g. "Aprovada")
  stone_status_date    timestamptz,            -- DATA DO ULTIMO STATUS

  -- Cadenzia classification fields
  approval_status      text not null default 'auto_approved'
                         check (approval_status in (
                           'auto_approved',    -- POS with known terminal → auto-assigned
                           'pending',          -- E-commerce → awaiting manual assignment
                           'approved',         -- manually approved via portal
                           'rejected'          -- manually rejected
                         )),
  approved_by          uuid references public.partners(id) on delete set null,
  approved_at          timestamptz,
  notes                text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.transactions is
  'One row per Stone transaction. POS transactions are auto-assigned via terminal lookup; '
  'E-commerce transactions start with approval_status=pending and need manual partner assignment.';

create index on public.transactions (client_id);
create index on public.transactions (partner_id);
create index on public.transactions (approval_status);
create index on public.transactions (sale_date);
create index on public.transactions (stonecode);


-- ── installment_schedule ──────────────────────────────────────────────────────
-- One row per installment per transaction.
-- A single-payment transaction (N DE PARCELAS = 1) has exactly one row.
-- A 6-installment transaction has 6 rows, each with a different due_date.
-- This is the table partners look at for "what will I receive next month".
create table public.installment_schedule (
  id                uuid primary key default uuid_generate_v4(),
  client_id         uuid not null references public.clients(id) on delete cascade,
  partner_id        uuid references public.partners(id) on delete set null,
  transaction_id    uuid not null references public.transactions(id) on delete cascade,

  installment_number  int not null,   -- 1, 2, 3 … N
  total_installments  int not null,   -- N (copy of transactions.installments)
  gross_amount        numeric(12,2) not null, -- gross_amount / total_installments
  net_amount          numeric(12,2) not null, -- net_amount / total_installments
  due_date            date not null,          -- expected payout date from Stone
  received_at         timestamptz,            -- set when money lands in account
  created_at          timestamptz not null default now(),

  unique (transaction_id, installment_number)
);

comment on table public.installment_schedule is
  'Derived payout schedule. Populated by n8n after a transaction is classified. '
  'One row per installment; partners see their own rows to know upcoming payments.';

create index on public.installment_schedule (client_id);
create index on public.installment_schedule (partner_id);
create index on public.installment_schedule (due_date);
create index on public.installment_schedule (transaction_id);


-- ── updated_at trigger ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- Policy: a partner can only see rows belonging to their client.
-- The portal reads auth.uid() → partners.auth_user_id → client_id.
-- =============================================================================

alter table public.clients            enable row level security;
alter table public.partners           enable row level security;
alter table public.card_terminals     enable row level security;
alter table public.transactions       enable row level security;
alter table public.installment_schedule enable row level security;

-- Helper: returns the client_id for the currently logged-in partner.
create or replace function public.my_client_id()
returns uuid language sql security definer stable as $$
  select client_id from public.partners where auth_user_id = auth.uid() limit 1;
$$;

-- Helper: returns the partner_id for the currently logged-in user.
create or replace function public.my_partner_id()
returns uuid language sql security definer stable as $$
  select id from public.partners where auth_user_id = auth.uid() limit 1;
$$;


-- clients: a partner can see their own client row only
create policy "partners_see_own_client"
  on public.clients for select
  using (id = public.my_client_id());

-- partners: partners see all partners within their client (needed for the approval UI)
create policy "partners_see_client_partners"
  on public.partners for select
  using (client_id = public.my_client_id());

-- card_terminals: scoped to client
create policy "partners_see_client_terminals"
  on public.card_terminals for select
  using (client_id = public.my_client_id());

-- transactions: scoped to client
-- (individual partner scoping — e.g. only see own transactions — can be added
--  via a separate policy once the per-partner view is designed)
create policy "partners_see_client_transactions"
  on public.transactions for select
  using (client_id = public.my_client_id());

-- transactions: partners can update approval_status, partner_id, approved_by
create policy "partners_approve_transactions"
  on public.transactions for update
  using (client_id = public.my_client_id())
  with check (client_id = public.my_client_id());

-- installment_schedule: scoped to client
create policy "partners_see_client_installments"
  on public.installment_schedule for select
  using (client_id = public.my_client_id());
