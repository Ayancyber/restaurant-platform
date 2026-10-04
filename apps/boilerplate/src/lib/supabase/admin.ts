import "server-only";
import { createClient } from "@supabase/supabase-js";

// ⚠️ SERVER-ONLY. Never import this in a client component.
// Uses service_role key — bypasses RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
