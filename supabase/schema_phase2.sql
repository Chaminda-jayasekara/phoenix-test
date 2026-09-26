-- Phoenix — Phase 2 schema (competition categories)
-- Run this in Supabase SQL Editor AFTER supabase/schema.sql

-- ---------- A safe, limited public view of institutions ----------
-- Contestant forms need to let students pick their school/university
-- from a dropdown, but the anon key has no SELECT permission on the
-- institutions table (it's insert-only, to protect office bearer
-- contact details). This view exposes only non-sensitive fields.
-- Views run with the owner's privileges by default, so this safely
-- bypasses RLS on the base table for just these columns.

create or replace view institutions_public as
  select id, type, name, district, province, address, postal_code
  from institutions;

grant select on institutions_public to anon;

-- ---------- Contestants (Tier 2 registration, any category) ----------
create table if not exists contestants (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id),
  category text not null check (
    category in ('graphic_design', 'videography', 'article_writing', 'poetry', 'photography', 'broadcasting')
  ),
  sub_category text,
  age_category text,
  full_name text not null,
  name_with_initials text not null,
  contact text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- ---------- Submissions (one per contestant, where applicable) ----------
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  contestant_id uuid not null references contestants(id) on delete cascade,
  submission_link text not null,
  submitted_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table contestants enable row level security;
alter table submissions enable row level security;

drop policy if exists "Anyone can register as a contestant" on contestants;
create policy "Anyone can register as a contestant"
  on contestants for insert
  to anon
  with check (true);

drop policy if exists "Anyone can submit an entry" on submissions;
create policy "Anyone can submit an entry"
  on submissions for insert
  to anon
  with check (true);

grant insert on contestants to anon;
grant insert on submissions to anon;

-- ---------- Indexes ----------
create index if not exists idx_contestants_category on contestants(category);
create index if not exists idx_contestants_institution on contestants(institution_id);
create index if not exists idx_submissions_contestant on submissions(contestant_id);
