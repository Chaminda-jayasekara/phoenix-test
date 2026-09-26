import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY client. Uses the service role key, which bypasses Row Level
// Security. Never import this file from a "use client" component — it
// must only run in Server Components / route handlers / middleware.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
