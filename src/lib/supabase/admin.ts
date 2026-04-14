import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";

let adminClient: SupabaseClient<Database, "screentime"> | null = null;

export const createSupabaseAdminClient = (): SupabaseClient<Database, "screentime"> => {
  if (!adminClient) {
    adminClient = createClient<Database, "screentime">(
      publicEnv.supabaseUrl,
      serverEnv.supabaseSecretKey,
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