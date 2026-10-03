-- ============================================================================
-- FounderOS — Complete Supabase schema
-- "One Company. One Operating System. Every Role. One Source of Truth."
--
-- Copy this entire file into the Supabase SQL Editor and run it once.
-- It is idempotent where practical (DROP ... IF EXISTS / CREATE OR REPLACE).
--
-- Contents:
--   1.  Extensions
--   2.  Enums / check constraints
--   3.  Tables + indexes
--   4.  Helper functions (SECURITY DEFINER, recursion-safe)
--   5.  updated_at triggers
--   6.  Row Level Security enablement + policies
--   7.  Auth trigger: create profile on signup
--   8.  Seed helper: assign roles to the six leadership seats
--
-- SECURITY NOTES
--   * Only the anon key is used by the frontend. The service-role key must
--     NEVER be placed in client code.
--   * get_my_role() is SECURITY DEFINER so policies can read profiles without
--     triggering recursive RLS evaluation on the profiles table itself.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 2. Types
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('ceo_cfo','cso_cgo','cmo_cso','cpo_cto','clo_coo','cno');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('backlog','todo','in_progress','blocked','review','completed','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low','medium','high','critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'decision_status') then
    create type decision_status as enum ('draft','pending','approved','rejected','implemented','archived');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Tables
-- ---------------------------------------------------------------------------

-- profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text,
  role        app_role,
  avatar_url  text,
  department  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- tasks ---------------------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  owner_id      uuid references public.profiles(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,
  function_area text,
  priority      task_priority not null default 'medium',
  status        task_status not null default 'todo',
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tasks_owner_idx  on public.tasks(owner_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_idx    on public.tasks(due_date);
create index if not exists tasks_area_idx   on public.tasks(function_area);

-- kpis ----------------------------------------------------------------------
create table if not exists public.kpis (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  owner_id      uuid references public.profiles(id) on delete set null,
  function_area text,
  target        numeric not null default 0,
  current_value numeric not null default 0,
  unit          text,
  status        text not null default 'on_track',
  period        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists kpis_owner_idx on public.kpis(owner_id);
create index if not exists kpis_area_idx  on public.kpis(function_area);

-- strategic_objectives ------------------------------------------------------
create table if not exists public.strategic_objectives (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  owner_id    uuid references public.profiles(id) on delete set null,
  priority    task_priority not null default 'medium',
  progress    integer not null default 0 check (progress between 0 and 100),
  status      text not null default 'in_progress',
  start_date  date,
  target_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists objectives_owner_idx on public.strategic_objectives(owner_id);

-- decisions -----------------------------------------------------------------
create table if not exists public.decisions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  category       text,
  requested_by   uuid references public.profiles(id) on delete set null,
  decision_owner uuid references public.profiles(id) on delete set null,
  status         decision_status not null default 'draft',
  decision       text,
  decision_date  timestamptz,
  due_date       date,
  outcome        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists decisions_status_idx on public.decisions(status);

-- expenses ------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  amount       numeric not null default 0,
  category     text,
  description  text,
  paid_by      uuid references public.profiles(id) on delete set null,
  status       text not null default 'pending',
  expense_date date default current_date,
  receipt_url  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists expenses_paid_by_idx on public.expenses(paid_by);
create index if not exists expenses_status_idx  on public.expenses(status);

-- budgets -------------------------------------------------------------------
create table if not exists public.budgets (
  id             uuid primary key default gen_random_uuid(),
  category       text not null,
  planned_amount numeric not null default 0,
  actual_amount  numeric not null default 0,
  period_start   date,
  period_end     date,
  owner_id       uuid references public.profiles(id) on delete set null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- meetings ------------------------------------------------------------------
create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  meeting_type text,
  meeting_date timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  agenda       text,
  notes        text,
  action_items text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- reports -------------------------------------------------------------------
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references public.profiles(id) on delete set null,
  title        text not null,
  report_type  text,
  period_start date,
  period_end   date,
  summary      text,
  status       text not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists reports_author_idx on public.reports(author_id);

-- notifications -------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  message    text,
  type       text not null default 'info',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id);

-- audit_logs ----------------------------------------------------------------
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  table_name text,
  record_id  text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_actor_idx on public.audit_logs(actor_id);

-- policy_register -----------------------------------------------------------
create table if not exists public.policy_register (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text,
  status     text not null default 'draft',
  version    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- risk_register -------------------------------------------------------------
create table if not exists public.risk_register (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text,
  severity   task_priority not null default 'medium',
  status     text not null default 'open',
  owner_id   uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- partnerships --------------------------------------------------------------
create table if not exists public.partnerships (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  partnership_type text,
  owner_id         uuid references public.profiles(id) on delete set null,
  status           text not null default 'exploring',
  progress         integer not null default 0 check (progress between 0 and 100),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- campaigns -----------------------------------------------------------------
create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  channel    text,
  owner_id   uuid references public.profiles(id) on delete set null,
  status     text not null default 'planning',
  progress   integer not null default 0 check (progress between 0 and 100),
  budget     numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Helper functions
-- ---------------------------------------------------------------------------

-- Returns the current user's role. SECURITY DEFINER so that RLS policies on
-- other tables can call it without evaluating profiles RLS recursively.
create or replace function public.get_my_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- True when the current user is the CEO/CFO seat.
create or replace function public.is_executive()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'ceo_cfo' from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.get_my_role() to authenticated;
grant execute on function public.is_executive() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables text[] := array[
    'profiles','tasks','kpis','strategic_objectives','decisions','expenses',
    'budgets','meetings','reports','policy_register','risk_register',
    'partnerships','campaigns'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.tasks                enable row level security;
alter table public.kpis                  enable row level security;
alter table public.strategic_objectives  enable row level security;
alter table public.decisions             enable row level security;
alter table public.expenses              enable row level security;
alter table public.budgets               enable row level security;
alter table public.meetings              enable row level security;
alter table public.reports               enable row level security;
alter table public.notifications         enable row level security;
alter table public.audit_logs            enable row level security;
alter table public.policy_register       enable row level security;
alter table public.risk_register         enable row level security;
alter table public.partnerships          enable row level security;
alter table public.campaigns             enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (true);  -- leadership directory is company-shared

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Users may edit their own name/department; only executives may change roles.
-- The role column is protected by a trigger below, so a plain update policy is safe.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_executive())
  with check (id = auth.uid() or public.is_executive());

-- Prevent non-executives from changing their own role.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_executive() then
    raise exception 'Only the CEO/CFO seat may change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_role_change on public.profiles;
create trigger guard_role_change before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- tasks ---------------------------------------------------------------------
-- All authenticated leadership can view tasks; owners can update their own;
-- executives can manage everything; creators can manage what they created.
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated using (true);

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (created_by = auth.uid() or owner_id = auth.uid() or public.is_executive());

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update to authenticated
  using (owner_id = auth.uid() or created_by = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or created_by = auth.uid() or public.is_executive());

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete to authenticated
  using (created_by = auth.uid() or public.is_executive());

-- kpis ----------------------------------------------------------------------
drop policy if exists kpis_select on public.kpis;
create policy kpis_select on public.kpis
  for select to authenticated using (true);

drop policy if exists kpis_write on public.kpis;
create policy kpis_write on public.kpis
  for all to authenticated
  using (owner_id = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or public.is_executive());

-- strategic_objectives ------------------------------------------------------
drop policy if exists objectives_select on public.strategic_objectives;
create policy objectives_select on public.strategic_objectives
  for select to authenticated using (true);

drop policy if exists objectives_write on public.strategic_objectives;
create policy objectives_write on public.strategic_objectives
  for all to authenticated
  using (owner_id = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or public.is_executive());

-- decisions -----------------------------------------------------------------
drop policy if exists decisions_select on public.decisions;
create policy decisions_select on public.decisions
  for select to authenticated using (true);

-- Anyone may raise/update a decision they requested; only the executive seat
-- (or the named decision owner) may approve/reject/implement.
drop policy if exists decisions_insert on public.decisions;
create policy decisions_insert on public.decisions
  for insert to authenticated
  with check (requested_by = auth.uid() or public.is_executive());

drop policy if exists decisions_update on public.decisions;
create policy decisions_update on public.decisions
  for update to authenticated
  using (
    public.is_executive()
    or decision_owner = auth.uid()
    or (requested_by = auth.uid() and status in ('draft','pending'))
  )
  with check (
    public.is_executive()
    or decision_owner = auth.uid()
    or (requested_by = auth.uid() and status in ('draft','pending'))
  );

-- expenses ------------------------------------------------------------------
-- FINANCE SECURITY: only the executive seat reads unrestricted company
-- expenses. Everyone else sees only their own submissions.
drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses
  for select to authenticated
  using (public.is_executive() or paid_by = auth.uid());

drop policy if exists expenses_insert on public.expenses;
create policy expenses_insert on public.expenses
  for insert to authenticated
  with check (paid_by = auth.uid() or public.is_executive());

-- Only the executive seat may change expense status (approve/reject).
drop policy if exists expenses_update on public.expenses;
create policy expenses_update on public.expenses
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

-- budgets -------------------------------------------------------------------
-- Finance-only.
drop policy if exists budgets_select on public.budgets;
create policy budgets_select on public.budgets
  for select to authenticated using (public.is_executive());

drop policy if exists budgets_write on public.budgets;
create policy budgets_write on public.budgets
  for all to authenticated
  using (public.is_executive())
  with check (public.is_executive());

-- meetings ------------------------------------------------------------------
drop policy if exists meetings_select on public.meetings;
create policy meetings_select on public.meetings
  for select to authenticated using (true);

drop policy if exists meetings_write on public.meetings;
create policy meetings_write on public.meetings
  for all to authenticated
  using (created_by = auth.uid() or public.is_executive())
  with check (created_by = auth.uid() or public.is_executive());

-- reports -------------------------------------------------------------------
-- Authors see their own; executives see company-wide.
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select to authenticated
  using (author_id = auth.uid() or public.is_executive());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert to authenticated
  with check (author_id = auth.uid() or public.is_executive());

drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports
  for update to authenticated
  using (author_id = auth.uid() or public.is_executive())
  with check (author_id = auth.uid() or public.is_executive());

-- notifications -------------------------------------------------------------
-- Users read and mark their own notifications read; the system inserts them.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated with check (true);

-- audit_logs ----------------------------------------------------------------
-- Any authenticated user may append an audit entry; only the executive seat
-- may read the audit trail.
drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs
  for insert to authenticated with check (actor_id = auth.uid());

drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs
  for select to authenticated using (public.is_executive());

-- policy_register / risk_register / partnerships / campaigns ----------------
-- Company-shared read; functional owners + executive manage.
drop policy if exists policies_select on public.policy_register;
create policy policies_select on public.policy_register
  for select to authenticated using (true);
drop policy if exists policies_write on public.policy_register;
create policy policies_write on public.policy_register
  for all to authenticated using (public.is_executive())
  with check (public.is_executive());

drop policy if exists risks_select on public.risk_register;
create policy risks_select on public.risk_register
  for select to authenticated using (true);
drop policy if exists risks_write on public.risk_register;
create policy risks_write on public.risk_register
  for all to authenticated
  using (owner_id = auth.uid() or created_by = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or created_by = auth.uid() or public.is_executive());

drop policy if exists partnerships_select on public.partnerships;
create policy partnerships_select on public.partnerships
  for select to authenticated using (true);
drop policy if exists partnerships_write on public.partnerships;
create policy partnerships_write on public.partnerships
  for all to authenticated
  using (owner_id = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or public.is_executive());

drop policy if exists campaigns_select on public.campaigns;
create policy campaigns_select on public.campaigns
  for select to authenticated using (true);
drop policy if exists campaigns_write on public.campaigns;
create policy campaigns_write on public.campaigns
  for all to authenticated
  using (owner_id = auth.uid() or public.is_executive())
  with check (owner_id = auth.uid() or public.is_executive());

-- ---------------------------------------------------------------------------
-- 7. Auto-create a profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 8. Storage: avatars bucket
--    Public-read bucket for founder profile images. Users may only write within
--    their own user-id folder (avatars/<uid>/...).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects
  for select to public
  using (bucket_id = 'avatars');

drop policy if exists avatars_insert on storage.objects;
create policy avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 9. Founder / role assignment helper
--    Run AFTER creating the six users in Authentication > Users.
--    Replace the emails with the real account emails.
--
--    Seat mapping:
--      CEO / CFO  Tamilselvan S
--      CSO / CGO  Ramana V
--      CMO / CSO  Sanmathi S
--      CPO / CTO  Thangaraj T
--      CLO / COO  Gokul Priya S
--      CNO        Silambarasan C
-- ---------------------------------------------------------------------------
-- update public.profiles set full_name = 'Tamilselvan S',  role = 'ceo_cfo', department = 'Executive / Finance'       where email = 'tamilselvan@company.example';
-- update public.profiles set full_name = 'Ramana V',       role = 'cso_cgo', department = 'Strategy / Growth'          where email = 'ramana@company.example';
-- update public.profiles set full_name = 'Sanmathi S',     role = 'cmo_cso', department = 'Marketing / Brand'          where email = 'sanmathi@company.example';
-- update public.profiles set full_name = 'Thangaraj T',    role = 'cpo_cto', department = 'Product / Technology'       where email = 'thangaraj@company.example';
-- update public.profiles set full_name = 'Gokul Priya S',  role = 'clo_coo', department = 'Legal / Operations'         where email = 'gokulpriya@company.example';
-- update public.profiles set full_name = 'Silambarasan C', role = 'cno',     department = 'Networking / Relationships' where email = 'silambarasan@company.example';

-- ============================================================================
-- End of schema
-- ============================================================================
