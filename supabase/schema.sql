-- Phoenix — database schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run

create extension if not exists "pgcrypto";

-- ---------- Institutions (Tier 1 registration) ----------
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('school', 'university')),
  name text not null,
  province text,
  district text,
  contact text,
  email text not null,
  address text not null,
  postal_code text not null,
  created_at timestamptz not null default now()
);

-- ---------- Office bearers (MIC / President / Secretary per institution) ----------
create table if not exists office_bearers (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id) on delete cascade,
  role text not null check (role in ('mic', 'president', 'secretary')),
  name text not null,
  contact text not null,
  email text not null
);

-- ---------- Row Level Security ----------
-- Public (anon) visitors may INSERT their registration, but may not
-- read anything back — only the admin dashboard (using the service
-- role key, which bypasses RLS entirely) can list registrations.

alter table institutions enable row level security;
alter table office_bearers enable row level security;

create policy "Anyone can register an institution"
  on institutions for insert
  to anon
  with check (true);

create policy "Anyone can add office bearers during registration"
  on office_bearers for insert
  to anon
  with check (true);

-- No select/update/delete policies are defined for anon, so those
-- operations are denied by default under RLS.

-- ---------- Indexes ----------
create index if not exists idx_institutions_type on institutions(type);
create index if not exists idx_office_bearers_institution on office_bearers(institution_id);

-- ---------- Next: contestants + submissions (Phase 2) ----------
-- When you're ready to add a competition category (e.g. Graphic Design),
-- extend this schema with something like:
--
-- create table contestants (
--   id uuid primary key default gen_random_uuid(),
--   institution_id uuid references institutions(id),
--   category text not null,
--   sub_category text,
--   age_group text,
--   full_name text not null,
--   name_with_initials text not null,
--   contact text not null,
--   email text not null,
--   created_at timestamptz not null default now()
-- );
--
-- create table submissions (
--   id uuid primary key default gen_random_uuid(),
--   contestant_id uuid references contestants(id),
--   submission_link text,
--   submitted_at timestamptz not null default now()
-- );
