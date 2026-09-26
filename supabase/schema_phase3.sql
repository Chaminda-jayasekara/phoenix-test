-- Phoenix — Phase 3 schema (group entries, e.g. Videography)
-- Run this in Supabase SQL Editor AFTER schema.sql and schema_phase2.sql

alter table contestants add column if not exists is_group boolean not null default false;
alter table contestants add column if not exists team_members text;
