import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Organization,
  OrganizationMembership,
  UserProfile,
} from "@/lib/types";

export interface AuthenticatedAppUser {
  user: User;
  profile: UserProfile;
  membership: OrganizationMembership;
  organization: Organization;
}

export const getAuthenticatedAppUser = async (): Promise<AuthenticatedAppUser> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const adminClient = createSupabaseAdminClient();
  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] =
    await Promise.all([
      adminClient
        .from("user_profiles")
        .select("user_id, email, full_name, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminClient
        .from("organization_memberships")
        .select("id, organization_id, user_id, role, status, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (membershipError) {
    throw membershipError;
  }

  if (!profile || !membership) {
    await supabase.auth.signOut();
    redirect("/account/login?error=missing-profile");
  }

  if (membership.status === "invited") {
    redirect("/account/setup-password");
  }

  const { data: organization, error: organizationError } = await adminClient
    .from("organizations")
    .select("id, name, slug, created_by, created_at, updated_at")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (organizationError) {
    throw organizationError;
  }

  if (!organization) {
    await supabase.auth.signOut();
    redirect("/account/login?error=missing-profile");
  }

  return {
    user,
    profile: profile as UserProfile,
    membership: membership as OrganizationMembership,
    organization: organization as Organization,
  };
};

export const requireOrganizationOwner = async () => {
  const auth = await getAuthenticatedAppUser();

  if (auth.membership.role !== "owner") {
    redirect("/panel?error=owner-only");
  }

  return auth;
};
