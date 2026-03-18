-- ============================================================
-- PDS Connect — Initial Schema Migration
-- Phase 0: enquiries table
-- Phase 1: industries, users, events (and related tables)
--
-- This migration is fully idempotent — safe to run multiple
-- times on a database that already has some or all objects.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ============================================================
-- PHASE 0: ENQUIRIES
-- ============================================================

create type if not exists enquiry_status as enum (
  'new',
  'contacted',
  'account_created',
  'onboarded',
  'rejected'
);

create type if not exists role_interest as enum ('buyer', 'procurer', 'unsure');

create table if not exists enquiries (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  company_name  text not null,
  email         text not null,
  phone         text,
  role_interest role_interest not null,
  message       text,
  status        enquiry_status not null default 'new',
  user_id       uuid,  -- FK to users (populated once account is created)
  created_at    timestamptz not null default now()
);

-- Index for admin panel queries
create index if not exists idx_enquiries_status on enquiries(status);
create index if not exists idx_enquiries_created_at on enquiries(created_at desc);

-- RLS: only admins/staff can read enquiries
alter table enquiries enable row level security;

drop policy if exists "admins_all_enquiries" on enquiries;
create policy "admins_all_enquiries" on enquiries
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

-- Public insert (landing page form)
drop policy if exists "public_insert_enquiry" on enquiries;
create policy "public_insert_enquiry" on enquiries
  for insert
  with check (true);


-- ============================================================
-- PHASE 1: FOUNDATION TABLES
-- ============================================================

-- Industries master list
create table if not exists industries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- Seed a few default industries
insert into industries (name) values
  ('Technology'),
  ('Food & Beverage'),
  ('Manufacturing'),
  ('Retail & Consumer Goods'),
  ('Healthcare'),
  ('Financial Services'),
  ('Education'),
  ('Agriculture'),
  ('Construction'),
  ('Logistics & Supply Chain')
on conflict (name) do nothing;


-- Users (mirrors Supabase Auth)
create type if not exists user_role as enum ('buyer', 'procurer', 'admin', 'staff', 'superadmin');

create table if not exists users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  name          text not null,
  company_name  text not null,
  role          user_role not null,
  website_url   text,
  industry_id   uuid references industries(id),
  tags          text,   -- comma-separated, admin-managed
  bio           text,
  logo_url      text,
  ai_summary    text,   -- last Gemini-generated summary (reference only)
  is_active     boolean not null default true,
  welcome_sent  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_industry on users(industry_id);

alter table users enable row level security;

-- Users can read their own record
drop policy if exists "users_read_own" on users;
create policy "users_read_own" on users
  for select using (auth.uid() = id);

-- Users can update their own editable fields
drop policy if exists "users_update_own" on users;
create policy "users_update_own" on users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins/staff full access
drop policy if exists "admins_all_users" on users;
create policy "admins_all_users" on users
  for all
  using (
    exists (
      select 1 from users u
      where u.id = auth.uid()
        and u.role in ('admin', 'staff', 'superadmin')
    )
  );

-- Now add the FK from enquiries to users (idempotent)
do $$ begin
  alter table enquiries
    add constraint fk_enquiries_user
    foreign key (user_id) references users(id) on delete set null;
exception when duplicate_object then null;
end $$;


-- Events
create type if not exists event_status as enum ('draft', 'live', 'closed');

create table if not exists events (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  description              text,
  venue_name               text,
  venue_address            text,
  event_start_date         date,
  event_end_date           date,
  matchup_open_date        date,
  matchup_close_date       date,
  max_matches_per_buyer    integer,    -- null = no cap
  max_matches_per_procurer integer,    -- null = no cap
  status                   event_status not null default 'draft',
  created_by               uuid references users(id),
  created_at               timestamptz not null default now()
);

create index if not exists idx_events_status on events(status);

alter table events enable row level security;

drop policy if exists "admins_all_events" on events;
create policy "admins_all_events" on events
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

-- End users see events they are assigned to (via event_participants)
drop policy if exists "users_see_assigned_events" on events;
create policy "users_see_assigned_events" on events
  for select
  using (
    exists (
      select 1 from event_participants ep
      where ep.event_id = events.id
        and ep.user_id = auth.uid()
        and ep.is_active = true
    )
  );


-- Event categories
create table if not exists event_categories (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name     text not null
);

-- Event tags
create table if not exists event_tags (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name     text not null
);


-- AI assignment results
create type if not exists ai_tab as enum ('confirmed', 'might_be_related');

create table if not exists ai_assignment_results (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events(id) on delete cascade,
  user_id          uuid not null references users(id) on delete cascade,
  ai_summary       text,
  relevance_score  integer check (relevance_score between 0 and 100),
  tab              ai_tab not null default 'confirmed',
  dismissed        boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table ai_assignment_results enable row level security;

drop policy if exists "admins_all_ai_results" on ai_assignment_results;
create policy "admins_all_ai_results" on ai_assignment_results
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );


-- Event participants
create type if not exists participant_role as enum ('buyer', 'procurer');

create table if not exists event_participants (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  role_in_event  participant_role not null,
  categories     text[],
  tags           text[],
  is_active      boolean not null default true,
  unique (event_id, user_id)
);

create index if not exists idx_ep_event on event_participants(event_id);
create index if not exists idx_ep_user on event_participants(user_id);

alter table event_participants enable row level security;

drop policy if exists "admins_all_participants" on event_participants;
create policy "admins_all_participants" on event_participants
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

-- Users can see co-participants in their assigned events
drop policy if exists "users_see_event_peers" on event_participants;
create policy "users_see_event_peers" on event_participants
  for select
  using (
    exists (
      select 1 from event_participants my_ep
      where my_ep.event_id = event_participants.event_id
        and my_ep.user_id = auth.uid()
        and my_ep.is_active = true
    )
  );


-- Time slots
create table if not exists time_slots (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  start_time timestamptz not null,
  end_time   timestamptz not null,
  is_booked  boolean not null default false
);

create index if not exists idx_slots_event on time_slots(event_id);

alter table time_slots enable row level security;

drop policy if exists "admins_all_slots" on time_slots;
create policy "admins_all_slots" on time_slots
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

drop policy if exists "event_users_see_slots" on time_slots;
create policy "event_users_see_slots" on time_slots
  for select
  using (
    exists (
      select 1 from event_participants ep
      where ep.event_id = time_slots.event_id
        and ep.user_id = auth.uid()
    )
  );


-- Match requests
create type if not exists match_status as enum (
  'pending',
  'awaiting_buyer',
  'negotiating',
  'scheduled',
  'declined',
  'cancelled'
);

create table if not exists match_requests (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  buyer_id     uuid not null references users(id),
  procurer_id  uuid not null references users(id),
  status       match_status not null default 'pending',
  time_slot_id uuid references time_slots(id),
  cancel_reason text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_mr_event on match_requests(event_id);
create index if not exists idx_mr_buyer on match_requests(buyer_id);
create index if not exists idx_mr_procurer on match_requests(procurer_id);
create index if not exists idx_mr_status on match_requests(status);

alter table match_requests enable row level security;

drop policy if exists "admins_all_matches" on match_requests;
create policy "admins_all_matches" on match_requests
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

drop policy if exists "users_own_matches" on match_requests;
create policy "users_own_matches" on match_requests
  for all
  using (buyer_id = auth.uid() or procurer_id = auth.uid());


-- Time negotiations
create type if not exists negotiation_status as enum (
  'pending',
  'accepted',
  'rejected',
  'countered',
  'auto_cancelled'
);

create table if not exists time_negotiations (
  id                uuid primary key default gen_random_uuid(),
  match_request_id  uuid not null references match_requests(id) on delete cascade,
  proposed_by       participant_role not null,
  time_slot_id      uuid not null references time_slots(id),
  status            negotiation_status not null default 'pending',
  reminder_sent_at  timestamptz,
  expires_at        timestamptz not null default (now() + interval '48 hours'),
  extension_hours   integer,
  extended_by       uuid references users(id),
  created_at        timestamptz not null default now()
);

create index if not exists idx_neg_match on time_negotiations(match_request_id);
create index if not exists idx_neg_expires on time_negotiations(expires_at);

alter table time_negotiations enable row level security;

drop policy if exists "admins_all_negotiations" on time_negotiations;
create policy "admins_all_negotiations" on time_negotiations
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );

drop policy if exists "users_own_negotiations" on time_negotiations;
create policy "users_own_negotiations" on time_negotiations
  for all
  using (
    exists (
      select 1 from match_requests mr
      where mr.id = time_negotiations.match_request_id
        and (mr.buyer_id = auth.uid() or mr.procurer_id = auth.uid())
    )
  );


-- System settings (single-row table)
create table if not exists system_settings (
  id                            uuid primary key default gen_random_uuid(),
  negotiation_reminder_hours    integer not null default 24,
  negotiation_auto_cancel_hours integer not null default 48,
  default_max_matches_buyer     integer,
  default_max_matches_procurer  integer,
  default_matchup_window_days   integer not null default 7,
  admin_notification_emails     text[],
  updated_by                    uuid references users(id),
  updated_at                    timestamptz not null default now()
);

-- Seed default settings
insert into system_settings (id) values (gen_random_uuid())
on conflict do nothing;

alter table system_settings enable row level security;

drop policy if exists "superadmin_settings" on system_settings;
create policy "superadmin_settings" on system_settings
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'superadmin'
    )
  );

drop policy if exists "admins_read_settings" on system_settings;
create policy "admins_read_settings" on system_settings
  for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );


-- Email logs
create type if not exists email_type as enum (
  'welcome',
  'event_assigned',
  'match_request',
  'match_confirmed',
  'meeting_scheduled',
  'match_declined',
  'negotiation_reminder',
  'negotiation_stalled_admin',
  'negotiation_auto_cancelled'
);

create table if not exists email_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete set null,
  event_id   uuid references events(id) on delete set null,
  type       email_type not null,
  sent_at    timestamptz not null default now(),
  status     text not null default 'sent'
);

create index if not exists idx_email_logs_user on email_logs(user_id);

alter table email_logs enable row level security;

drop policy if exists "admins_all_email_logs" on email_logs;
create policy "admins_all_email_logs" on email_logs
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role in ('admin', 'staff', 'superadmin')
    )
  );


-- ============================================================
-- HELPER: auto-update updated_at on match_requests
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists match_requests_updated_at on match_requests;
create trigger match_requests_updated_at
  before update on match_requests
  for each row execute function update_updated_at();
