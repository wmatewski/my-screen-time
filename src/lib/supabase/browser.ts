import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env/public";
import { supabaseAuthCookieOptions } from "@/lib/session";

let browserClient: SupabaseClient<Database> | null = null;

export const createSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      publicEnv.supabaseUrl,
      publicEnv.supabasePublishableKey,
      {
        cookieOptions: supabaseAuthCookieOptions,
      },
    );
  }

  return browserClient;
};
