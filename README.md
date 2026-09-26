# Phoenix — Competition Registration Website

Phase 1: institution registration (School + University) with a protected
admin dashboard. Built with Next.js (App Router) + Supabase.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the `institutions`
   and `office_bearers` tables with Row Level Security enabled.
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret)

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Supabase values, and set `ADMIN_USER` / `ADMIN_PASSWORD` to
whatever you want the organizers to log in with at `/admin`.

## 3. Install and run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

- `/register/school` — school registration flow
- `/register/university` — university registration flow
- `/admin` — list of all registrations (asks for the username/password
  you set in `.env.local`)

## 4. Deploy

Push this to a GitHub repo, then import it into
[Vercel](https://vercel.com) (or your own host that supports Next.js).
Add the same environment variables from `.env.local` in your host's
project settings — **do not** commit `.env.local`.

## Project structure

```
app/
  page.js                 landing page
  register/school/        school registration
  register/university/    university registration
  admin/                  organizer dashboard (protected by middleware.js)
components/
  ui.jsx                  design system (Card, Button, Field, etc.)
  RegistrationForm.jsx    the 3-step form, shared by school & university
  AdminList.jsx           filterable/expandable admin table
lib/
  supabaseClient.js        browser client (anon key — insert only)
  supabaseAdmin.js         server-only client (service role key — full read)
  data.js                  provinces/districts + govt university list
supabase/
  schema.sql               run this in Supabase's SQL editor
middleware.js               Basic Auth gate on /admin
```

## What's next (Phase 2)

Add a competition category (start with Graphic Design — simplest, no
group/team logic). It'll reuse the same `institutions` dropdown to
select a school/university, then add `contestants` and `submissions`
tables (schema sketch already included at the bottom of
`supabase/schema.sql`).
