-- Phoenix — Phase 4 schema (CMS: dynamic categories, site settings)
-- Run this in Supabase SQL Editor AFTER schema.sql, schema_phase2.sql, schema_phase3.sql

-- ---------- Site-wide settings (single row) ----------
create table if not exists site_settings (
  id int primary key default 1,
  event_date timestamptz,
  hero_description text,
  general_rules_video_url text,
  general_rules_pdf_url text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, hero_description)
values (
  1,
  'A celebration of creativity, resilience, and innovation in media arts. Get ready to witness the rebirth of ideas and the rise of new voices!'
)
on conflict (id) do nothing;

-- ---------- Dynamic competition categories ----------
-- Replaces the hardcoded CATEGORIES array in lib/data.js. The admin
-- can now add/edit/remove categories without a code deploy.
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text,
  age_categories jsonb not null default '[]',
  sub_categories jsonb,
  nested_sub_categories jsonb,
  supports_group_entry boolean not null default false,
  has_submission boolean not null default true,
  submission_label text default 'Submission link',
  submission_hint text,
  rules_video_url text,
  rules_pdf_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed with the 6 categories already live, so nothing is lost switching over.
insert into categories
  (slug, label, description, age_categories, sub_categories, nested_sub_categories, supports_group_entry, has_submission, submission_label, submission_hint, sort_order)
values
  ('graphic-design', 'Graphic Design', 'Design a poster, logo, or digital artwork for the competition brief.',
    '["Intermediate","Senior","University"]', null, null, false, true,
    'Submission link', 'Link to your design file(s) — Google Drive, etc.', 1),
  ('article-writing', 'Article Writing', 'Submit a written article on the competition''s given theme.',
    '["Intermediate","Senior","University"]', null, null, false, true,
    'Submission link', 'Google Drive link to your article (PDF or Doc).', 2),
  ('poetry', 'Poetry', 'Submit an original poem on the competition''s given theme.',
    '["Intermediate","Senior","University"]', null, null, false, true,
    'Submission link', 'Google Drive link to your poem (PDF or Doc).', 3),
  ('photography', 'Photography', 'Submit your best shot in one of three photography themes.',
    '["School open","University open"]', '["People and Lifestyle","Nature and Wildlife","Mobile Photography"]', null, false, true,
    'Submission link', 'Google Drive link to your photo(s).', 4),
  ('videography', 'Videography', 'Submit a short film or video edit for the competition — solo or as a group.',
    '["School open","University open"]', '["Short Film","Video Editing"]', null, true, true,
    'Submission link', 'YouTube, Facebook, or Google Drive link to your video.', 5),
  ('broadcasting', 'Broadcasting', 'Judged live on competition day — no online submission needed. One participant may enter only one sub-event.',
    '["Junior","Intermediate","Senior","University"]', null,
    '{"Announcing":["Sinhala","English","Tamil"],"Dubbing":["Sinhala","English","Tamil"],"Sport Commentary":["Sinhala","English"],"News Editing":["Sinhala","English"]}',
    false, false, 'Submission link', null, 6)
on conflict (slug) do nothing;

-- ---------- Row Level Security ----------
-- Categories and settings are public read data (they drive the public
-- site), but only writable via the service role key (admin server actions).

alter table site_settings enable row level security;
drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings" on site_settings for select to anon using (true);
grant select on site_settings to anon;

alter table categories enable row level security;
drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories" on categories for select to anon using (true);
grant select on categories to anon;

-- ---------- Contestants: category is now free text, not a fixed enum ----------
-- Since categories are admin-managed now instead of a hardcoded list,
-- drop the old check constraint that only allowed 6 specific values.
alter table contestants drop constraint if exists contestants_category_check;

create index if not exists idx_categories_sort on categories(sort_order);
