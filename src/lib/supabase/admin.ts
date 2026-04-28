import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env/public";
import { getSupabaseSecretKey } from "@/lib/env/server";

let adminClient: SupabaseClient<Database, "flowa"> | null = null;

export const createSupabaseAdminClient = (): SupabaseClient<Database, "flowa"> => {
  if (!adminClient) {
    adminClient = createClient<Database, "flowa">(
      publicEnv.supabaseUrl,
      getSupabaseSecretKey(),
      {
      db: {
        schema: "flowa",
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