"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { serverEnv } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const normalizeEmail = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const loginAdminAction = async (formData: FormData) => {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=invalid-credentials");
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!data || data.status === "disabled") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-authorized");
  }

  redirect("/admin");
};

export const logoutAdminAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
};

export const inviteAdminAction = async (formData: FormData) => {
  const email = normalizeEmail(formData.get("email"));

  if (!email) {
    redirect("/admin?error=missing-email");
  }

  const { user } = await getAuthenticatedAdmin();
  const adminClient = createSupabaseAdminClient();

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: serverEnv.adminInviteRedirectUrl,
    data: {
      invitedBy: user.id,
      source: "aura-clarity-admin-panel",
    },
  });

  if (error || !data.user?.id) {
    redirect("/admin?error=invite-failed");
  }

  const inviteeId = data.user.id;

  const { error: upsertError } = await adminClient.from("admin_profiles").upsert(
    {
      user_id: inviteeId,
      email,
      role: "admin",
      status: "invited",
      invited_by: user.id,
    },
    {
      onConflict: "user_id",
    },
  );

  if (upsertError) {
    throw upsertError;
  }

  await adminClient.from("admin_audit_log").insert({
    actor_user_id: user.id,
    action: "invite_admin",
    target_email: email,
    metadata: {
      inviteeId,
    },
  });

  redirect("/admin?invite=sent");
};

export const setAdminPasswordAction = async (formData: FormData) => {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect("/admin/setup-password?error=weak-password");
  }

  if (password !== confirmPassword) {
    redirect("/admin/setup-password?error=password-mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?error=session-expired");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/admin/setup-password?error=update-failed");
  }

  const adminClient = createSupabaseAdminClient();
  await adminClient
    .from("admin_profiles")
    .update({ status: "active" })
    .eq("user_id", user.id);

  redirect("/admin?password=updated");
};