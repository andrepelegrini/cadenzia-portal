-- =============================================================================
-- Cadenzia — Pending Items (Home page task boards)
-- Migration: 0002_pending_items.sql
-- =============================================================================
-- Manually-tracked to-dos shown on the Home page in two boards:
--   'personal'     — things the partner must do herself (pay staff, send docs…)
--   'third_party'  — things that depend on someone else (charge a client…)
-- =============================================================================

create table public.pending_items (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  created_by   uuid references public.partners(id) on delete set null,

  kind         text not null check (kind in ('personal', 'third_party')),
  description  text not null,
  due_date     date,

  completed    boolean not null default false,
  completed_at timestamptz,

  created_at   timestamptz not null default now()
);

comment on table public.pending_items is
  'Manually-entered to-dos shown on the Home page: personal (partner does it herself) '
  'vs third_party (waiting on someone else, e.g. "charge Maria").';

create index on public.pending_items (client_id);
create index on public.pending_items (kind);
create index on public.pending_items (due_date);

alter table public.pending_items enable row level security;

-- Everyone within a client can see, create, and update (complete) pending items —
-- this is a shared task board for the clinic's partners.
create policy "partners_see_client_pending_items"
  on public.pending_items for select
  using (client_id = public.my_client_id());

create policy "partners_insert_client_pending_items"
  on public.pending_items for insert
  with check (client_id = public.my_client_id());

create policy "partners_update_client_pending_items"
  on public.pending_items for update
  using (client_id = public.my_client_id())
  with check (client_id = public.my_client_id());

create policy "partners_delete_client_pending_items"
  on public.pending_items for delete
  using (client_id = public.my_client_id());
