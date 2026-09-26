-- Phoenix — Phase 6 schema (data validation constraints)
-- Run this in Supabase SQL Editor after the previous schema files.
--
-- These CHECK constraints protect against garbage/malicious data being
-- inserted directly via the public API (bypassing your form's own
-- validation, which anyone technically could do since the anon key is
-- public). They don't replace RLS — RLS controls who can write, these
-- control what shape that write must have.

-- ---------- institutions ----------
alter table institutions drop constraint if exists institutions_email_format;
alter table institutions add constraint institutions_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table institutions drop constraint if exists institutions_name_length;
alter table institutions add constraint institutions_name_length
  check (char_length(name) between 2 and 200);

alter table institutions drop constraint if exists institutions_address_length;
alter table institutions add constraint institutions_address_length
  check (char_length(address) between 2 and 500);

-- ---------- office_bearers ----------
alter table office_bearers drop constraint if exists office_bearers_email_format;
alter table office_bearers add constraint office_bearers_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table office_bearers drop constraint if exists office_bearers_name_length;
alter table office_bearers add constraint office_bearers_name_length
  check (char_length(name) between 2 and 150);

-- ---------- contestants ----------
alter table contestants drop constraint if exists contestants_email_format;
alter table contestants add constraint contestants_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table contestants drop constraint if exists contestants_name_length;
alter table contestants add constraint contestants_name_length
  check (char_length(full_name) between 2 and 150);

-- ---------- submissions ----------
alter table submissions drop constraint if exists submissions_link_length;
alter table submissions add constraint submissions_link_length
  check (char_length(submission_link) between 5 and 2000);
