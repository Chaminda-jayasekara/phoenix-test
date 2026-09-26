-- Phoenix — Phase 9 schema (site-wide audit: security + performance)
-- Run this in Supabase SQL Editor after the previous schema files.
-- Safe to run anytime — every statement is idempotent.

-- ---------- Explicit grants ----------
-- institutions/office_bearers inserts have been working via Supabase's
-- default project-level privileges for anon on the public schema, but
-- that's an implicit dependency, not something declared in this repo.
-- Making it explicit means this schema is fully self-contained and
-- portable to a fresh Supabase project or any Postgres+PostgREST setup
-- where those defaults might differ.
grant insert on institutions to anon;
grant insert on office_bearers to anon;

-- ---------- Missing indexes ----------
-- The admin dashboard sorts both of these by created_at descending.
-- At a few hundred rows Postgres doesn't notice; at a few thousand,
-- an index turns that sort from "scan everything" into "already
-- sorted, just read it."
create index if not exists idx_institutions_created_at on institutions(created_at desc);
create index if not exists idx_contestants_created_at on contestants(created_at desc);
