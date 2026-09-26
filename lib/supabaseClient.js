import { createClient } from "@supabase/supabase-js";

// Public client — used from the browser. Only has access to what your
// Row Level Security policies allow (see supabase/schema.sql).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
