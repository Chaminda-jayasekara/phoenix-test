-- Phoenix — Phase 11 schema (individual vs club university registration)
-- Run this in Supabase SQL Editor after the previous schema files.
-- Safe to run anytime — every statement is idempotent.
--
-- Universities can now register either as a media club (the existing
-- flow — club name + MIC/President/Secretary office bearers) or as a
-- single individual competing on their own behalf (just their own
-- name, contact, email and address — no club name, no office
-- bearers). Schools are unaffected and stay club-style only.

alter table institutions add column if not exists entry_type text;
alter table institutions add column if not exists representative_name text;

-- Existing rows (all clubs, from before this column existed) default
-- to 'club' so old data stays valid under the new constraints below.
update institutions set entry_type = 'club' where entry_type is null;

alter table institutions alter column entry_type set default 'club';

alter table institutions drop constraint if exists institutions_entry_type_check;
alter table institutions add constraint institutions_entry_type_check
  check (entry_type in ('individual', 'club'));

-- Club name is only required for university clubs now — individual
-- university entrants and all schools are exempt.
alter table institutions drop constraint if exists institutions_club_name_required;
alter table institutions add constraint institutions_club_name_required
  check (
    type = 'school'
    or entry_type = 'individual'
    or (entry_type = 'club' and club_name is not null and char_length(club_name) between 2 and 200)
  ) not valid;

-- An individual entrant needs their own name recorded somewhere,
-- since there's no office bearer row for them.
alter table institutions drop constraint if exists institutions_representative_name_required;
alter table institutions add constraint institutions_representative_name_required
  check (
    entry_type <> 'individual'
    or (representative_name is not null and char_length(representative_name) between 2 and 200)
  ) not valid;

-- Individual entrants don't fill in a postal code (only name, contact,
-- email and address), so it can no longer be unconditionally required.
alter table institutions alter column postal_code drop not null;
alter table institutions drop constraint if exists institutions_postal_code_required;
alter table institutions add constraint institutions_postal_code_required
  check (
    entry_type = 'individual'
    or (postal_code is not null and char_length(postal_code) > 0)
  ) not valid;

-- The public-facing view (used by the searchable institution picker on
-- category registration forms) needs to expose the new fields too, so
-- individual entrants are searchable and label correctly.
create or replace view institutions_public as
  select id, type, name, club_name, entry_type, representative_name, district, province, address, postal_code
  from institutions;
