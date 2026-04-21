"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedAppUser, requireOrganizationOwner } from "@/lib/app-auth";
import { serverEnv } from "@/lib/env/server";
import { createBaseSlug, createUniqueSlug } from "@/lib/slug";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const normalizeEmail = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeText = (value: FormDataEntryValue | null) => String(value ?? "").trim();

export const registerUserAction = async (formData: FormData) => {
  const fullName = normalizeText(formData.get("fullName"));
  const organizationName = normalizeText(formData.get("organizationName"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (fullName.length < 2 || organizationName.length < 2 || !email) {
    redirect("/account/register?error=missing-fields");
  }

  if (password.length < 8) {
    redirect("/account/register?error=weak-password");
  }

  if (password !== confirmPassword) {
    redirect("/account/register?error=password-mismatch");
  }

  const adminClient = createSupabaseAdminClient();
  const organizationSlug = await createUniqueSlug(createBaseSlug(organizationName), async (candidate) => {
    const { data } = await adminClient.from("organizations").select("id").eq("slug", candidate).maybeSingle();
    return Boolean(data);
  });

  const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      fullName,
    },
  });

  if (createUserError || !createdUserData.user) {
    redirect("/account/register?error=registration-failed");
  }

  const userId = createdUserData.user.id;

  try {
    const { error: profileError } = await adminClient.from("user_profiles").insert({
      user_id: userId,
      email,
      full_name: fullName,
    });

    if (profileError) {
      throw profileError;
    }

    const { data: organizationData, error: organizationError } = await adminClient
      .from("organizations")
      .insert({
        name: organizationName,
        slug: organizationSlug,
        created_by: userId,
      })
      .select("id")
      .single();

    if (organizationError || !organizationData) {
      throw organizationError ?? new Error("Unable to create organization");
    }

    const { error: membershipError } = await adminClient.from("organization_memberships").insert({
      organization_id: organizationData.id,
      user_id: userId,
      role: "owner",
      status: "active",
    });

    if (membershipError) {
      throw membershipError;
    }
  } catch {
    await adminClient.auth.admin.deleteUser(userId);
    redirect("/account/register?error=registration-failed");
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    redirect("/account/login?error=invalid-credentials");
  }

  redirect("/panel?registered=1");
};

export const loginUserAction = async (formData: FormData) => {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/account/login?error=missing-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/account/login?error=invalid-credentials");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("user_profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/account/login?error=missing-profile");
  }

  const { data: membership, error: membershipError } = await adminClient
    .from("organization_memberships")
    .select("status")
    .eq("user_id", profile.user_id)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    await supabase.auth.signOut();
    redirect("/account/login?error=missing-profile");
  }

  if (membership.status === "invited") {
    redirect("/account/setup-password");
  }

  redirect("/panel");
};

export const logoutUserAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/account/login");
};

export const createTrackedSessionAction = async (formData: FormData) => {
  const { user, organization } = await getAuthenticatedAppUser();
  const name = normalizeText(formData.get("name"));
  const description = normalizeText(formData.get("description"));

  if (name.length < 2) {
    redirect("/panel?error=missing-session-name");
  }

  const adminClient = createSupabaseAdminClient();
  const slug = await createUniqueSlug(createBaseSlug(name), async (candidate) => {
    const { data } = await adminClient.from("tracked_sessions").select("id").eq("slug", candidate).maybeSingle();
    return Boolean(data);
  });

  const { error } = await adminClient.from("tracked_sessions").insert({
    organization_id: organization.id,
    created_by: user.id,
    name,
    slug,
    description: description || null,
  });

  if (error) {
    redirect("/panel?error=session-create-failed");
  }

  redirect("/panel?session=created");
};

export const inviteOrganizationMemberAction = async (formData: FormData) => {
  const { organization, user } = await requireOrganizationOwner();
  const fullName = normalizeText(formData.get("fullName"));
  const email = normalizeEmail(formData.get("email"));

  if (fullName.length < 2 || !email) {
    redirect("/panel?error=missing-member-fields");
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: serverEnv.userInviteRedirectUrl,
    data: {
      fullName,
      invitedBy: user.id,
      organizationId: organization.id,
      source: "aura-clarity-organization",
    },
  });

  if (error || !data.user?.id) {
    redirect("/panel?error=member-invite-failed");
  }

  const inviteeId = data.user.id;
  const [{ error: profileError }, { error: membershipError }] = await Promise.all([
    adminClient.from("user_profiles").upsert(
      {
        user_id: inviteeId,
        email,
        full_name: fullName,
      },
      {
        onConflict: "user_id",
      },
    ),
    adminClient.from("organization_memberships").upsert(
      {
        organization_id: organization.id,
        user_id: inviteeId,
        role: "member",
        status: "invited",
      },
      {
        onConflict: "user_id",
      },
    ),
  ]);

  if (profileError || membershipError) {
    redirect("/panel?error=member-invite-failed");
  }

  redirect("/panel?invite=sent");
};

export const setUserPasswordAction = async (formData: FormData) => {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect("/account/setup-password?error=weak-password");
  }

  if (password !== confirmPassword) {
    redirect("/account/setup-password?error=password-mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login?error=session-expired");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/account/setup-password?error=update-failed");
  }

  const adminClient = createSupabaseAdminClient();
  await adminClient
    .from("organization_memberships")
    .update({ status: "active" })
    .eq("user_id", user.id);

  redirect("/panel?password=updated");
};
