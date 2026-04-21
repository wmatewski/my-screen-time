import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getSupabaseSecretKey } from "@/lib/env/server";
import { publicEnv } from "@/lib/env/public";

let adminClient: SupabaseClient<Database, "screentime"> | null = null;

export const createSupabaseAdminClient = (): SupabaseClient<Database, "screentime"> => {
  if (!adminClient) {
    adminClient = createClient<Database, "screentime">(
      publicEnv.supabaseUrl,
      getSupabaseSecretKey(),
      {
        db: {
          schema: "screentime",
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
};
