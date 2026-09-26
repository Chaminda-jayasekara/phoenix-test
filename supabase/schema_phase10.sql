-- Phoenix — Phase 10 schema (university club names)
-- Run this in Supabase SQL Editor after the previous schema files.
--
-- Some universities have more than one media club, so a university
-- registration alone doesn't uniquely identify who's registering.
-- This adds a club name (required for universities, unused for
-- schools) and makes it visible everywhere an institution shows up.

alter table institutions add column if not exists club_name text;

-- Enforce it at the database level too, for new/updated rows — a
-- university row without a club name gets rejected even if someone
-- bypasses the form entirely. Added as NOT VALID so it doesn't choke
-- on any university rows already in your database from before this
-- field existed — those stay as-is, only new/changed rows are checked.
alter table institutions drop constraint if exists institutions_club_name_required;
alter table institutions add constraint institutions_club_name_required
  check (
    type = 'school'
    or (type = 'university' and club_name is not null and char_length(club_name) between 2 and 200)
  ) not valid;

-- The public-facing view (used by the searchable institution picker on
-- category registration forms) needs to expose club_name too.
create or replace view institutions_public as
  select id, type, name, club_name, district, province, address, postal_code
  from institutions;
