-- Phoenix — Phase 8 schema (admin-configurable custom form fields)
-- Run this in Supabase SQL Editor after the previous schema files.
--
-- Lets the admin add or remove extra questions on a category's
-- registration form (e.g. "T-shirt size", "Dietary requirements")
-- without a code change. Each category stores its own list of field
-- definitions as JSON; each contestant stores the answers as JSON,
-- keyed by field key.

alter table categories add column if not exists custom_fields jsonb not null default '[]';
alter table contestants add column if not exists custom_field_values jsonb not null default '{}';

comment on column categories.custom_fields is
  'Array of admin-defined extra form fields for this category''s registration form. '
  'Each item: {"key","label","type","required","options","hint"}. '
  'type is one of: text, textarea, number, email, tel, url, select, checkbox. '
  'options is a comma-separated string, only used when type = select.';

comment on column contestants.custom_field_values is
  'Answers to the category''s custom_fields at the time of registration, keyed by field key.';
