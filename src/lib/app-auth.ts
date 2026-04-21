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

const resolveAuthenticatedUser = async (user: User | null): Promise<AuthenticatedAppUser | null> => {
  if (!user) {
    return null;
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
    return null;
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
    return null;
  }

  return {
    user,
    profile: profile as UserProfile,
    membership: membership as OrganizationMembership,
    organization: organization as Organization,
  };
};

export const getOptionalAuthenticatedAppUser = async (): Promise<AuthenticatedAppUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const auth = await resolveAuthenticatedUser(user);

  if (user && !auth) {
    await supabase.auth.signOut();
  }

  return auth;
};

export const getAuthenticatedAppUser = async (): Promise<AuthenticatedAppUser> => {
  const auth = await getOptionalAuthenticatedAppUser();

  if (!auth) {
    redirect("/login");
  }

  if (auth.membership.status === "invited") {
    redirect("/password-reset");
  }

  return auth;
};

export const requireOrganizationOwner = async () => {
  const auth = await getAuthenticatedAppUser();

  if (auth.membership.role !== "owner") {
    redirect("/dashboard/sessions?error=owner-only");
  }

  return auth;
};
