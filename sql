-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.institutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['school'::text, 'university'::text])),
  name text NOT NULL,
  province text,
  district text,
  contact text,
  email text NOT NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT institutions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.office_bearers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mic'::text, 'president'::text, 'secretary'::text])),
  name text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  CONSTRAINT office_bearers_pkey PRIMARY KEY (id),
  CONSTRAINT office_bearers_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.contestants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid,
  category text NOT NULL,
  sub_category text,
  age_category text,
  full_name text NOT NULL,
  name_with_initials text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_group boolean NOT NULL DEFAULT false,
  team_members text,
  CONSTRAINT contestants_pkey PRIMARY KEY (id),
  CONSTRAINT contestants_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contestant_id uuid NOT NULL,
  submission_link text NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_contestant_id_fkey FOREIGN KEY (contestant_id) REFERENCES public.contestants(id)
);
CREATE TABLE public.site_settings (
  id integer NOT NULL DEFAULT 1,
  event_date timestamp with time zone,
  hero_description text,
  general_rules_video_url text,
  general_rules_pdf_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  age_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  sub_categories jsonb,
  nested_sub_categories jsonb,
  supports_group_entry boolean NOT NULL DEFAULT false,
  has_submission boolean NOT NULL DEFAULT true,
  submission_label text DEFAULT 'Submission link'::text,
  submission_hint text,
  rules_video_url text,
  rules_pdf_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);