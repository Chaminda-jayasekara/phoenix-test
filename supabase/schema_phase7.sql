-- Phoenix — Phase 7 schema (registration on/off toggles)
-- Run this in Supabase SQL Editor after the previous schema files.

alter table site_settings add column if not exists school_registration_open boolean not null default true;
alter table site_settings add column if not exists university_registration_open boolean not null default true;
alter table categories add column if not exists is_open boolean not null default true;

-- ---------- Enforce the toggles at the database level too ----------
-- The UI hides closed registration forms, but since the anon key is
-- public, anyone could still POST directly to Supabase's API. These
-- updated policies make the toggle a real block, not just a UI hint.

drop policy if exists "Anyone can register an institution" on institutions;
create policy "Anyone can register an institution"
  on institutions for insert
  to anon
  with check (
    (type = 'school' and (select school_registration_open from site_settings where id = 1) is not false)
    or
    (type = 'university' and (select university_registration_open from site_settings where id = 1) is not false)
  );

drop policy if exists "Anyone can register as a contestant" on contestants;
create policy "Anyone can register as a contestant"
  on contestants for insert
  to anon
  with check (
    (select is_open from categories where slug = contestants.category) is not false
  );
