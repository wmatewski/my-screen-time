import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/types";

export const getAuthenticatedAdmin = async (): Promise<{
  user: User;
  profile: AdminProfile;
}> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("admin_profiles")
    .select("user_id, email, role, status, invited_by, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.status === "disabled") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-authorized");
  }

  if (data.status === "invited") {
    await adminClient
      .from("admin_profiles")
      .update({ status: "active" })
      .eq("user_id", user.id);

    data.status = "active";
  }

  return {
    user,
    profile: data as AdminProfile,
  };
};