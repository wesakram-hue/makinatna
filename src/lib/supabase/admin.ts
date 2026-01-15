import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

export function createAdminClient() {
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin client");
  }
  if (!serviceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin client");
  }

  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
