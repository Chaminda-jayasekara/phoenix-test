-- Phoenix — Phase 5 schema (real WhatsApp group links)
-- Run this in Supabase SQL Editor after schema_phase4.sql.
--
-- Adds the columns behind the admin-editable WhatsApp links shown on
-- confirmation screens after registering. Safe to run even if some of
-- these columns already exist in your database.

alter table site_settings add column if not exists school_whatsapp_link text;
alter table site_settings add column if not exists university_whatsapp_link text;
alter table categories add column if not exists whatsapp_group_link text;
