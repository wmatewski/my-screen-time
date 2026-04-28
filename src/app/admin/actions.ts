"use server";

import { redirect } from "next/navigation";

import {
  activatePendingMemberships,
  ensureProfileForUser,
  getAuthenticatedAdmin,
} from "@/lib/admin-auth";
import type { Database, Json } from "@/lib/database.types";
import { getAdminInviteRedirectUrl } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MembershipRole = Database["flowa"]["Enums"]["membership_role"];
type SessionAgeMode = Database["flowa"]["Enums"]["age_mode"];
type SessionInsert = Database["flowa"]["Tables"]["sessions"]["Insert"];
type SessionUpdate = Database["flowa"]["Tables"]["sessions"]["Update"];
type SessionCollaboratorInsert = Database["flowa"]["Tables"]["session_collaborators"]["Insert"];

const normalizeEmail = (value: FormDataEntryValue | string | null | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const ensureUniqueSlug = async (
  table: "organizations" | "sessions",
  source: string,
) => {
  const adminClient = createSupabaseAdminClient();
  const baseSlug = slugify(source) || `${table}-flowa`;
  const { data, error } = await adminClient
    .from(table)
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw error;
  }

  const existingSlugs = new Set(((data as Array<{ slug: string }> | null) ?? []).map((item) => item.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
};

const parsePositiveNumber = (value: FormDataEntryValue | null, fallback: number) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseRole = (value: FormDataEntryValue | null): MembershipRole => {
  const parsed = String(value ?? "moderator");
  return parsed === "owner" || parsed === "admin" || parsed === "moderator"
    ? parsed
    : "moderator";
};

const logOrganizationActivity = async (input: {
  organizationId: string;
  actorUserId: string | null;
  activityType: string;
  title: string;
  description?: string | null;
  sessionId?: string | null;
  metadata?: Json;
}) => {
  const adminClient = createSupabaseAdminClient();
  await adminClient.from("activity_log").insert({
    organization_id: input.organizationId,
    actor_user_id: input.actorUserId,
    activity_type: input.activityType,
    title: input.title,
    description: input.description ?? null,
    session_id: input.sessionId ?? null,
    metadata: input.metadata ?? {},
  });
};

export const loginAdminAction = async (formData: FormData) => {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/auth?error=missing-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/auth?error=invalid-credentials");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?error=invalid-credentials");
  }

  await activatePendingMemberships(user);
  await ensureProfileForUser(user);

  redirect("/admin");
};

export const logoutAdminAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth");
};

export const registerOrganizerAction = async (formData: FormData) => {
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!organizationName || !email || !password || !confirmPassword) {
    redirect("/auth?error=missing-registration-fields");
  }

  if (password.length < 8) {
    redirect("/auth?error=weak-password");
  }

  if (password !== confirmPassword) {
    redirect("/auth?error=password-mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        organizationName,
      },
    },
  });

  if (error || !data.user?.id) {
    redirect("/auth?error=registration-failed");
  }

  const adminClient = createSupabaseAdminClient();
  const organizationSlug = await ensureUniqueSlug("organizations", organizationName);

  await ensureProfileForUser(data.user);

  const { data: organizationRow, error: organizationError } = await adminClient
    .from("organizations")
    .insert({
      name: organizationName,
      slug: organizationSlug,
      created_by: data.user.id,
    })
    .select("id, name, slug, created_by, created_at, updated_at")
    .single();

  if (organizationError) {
    throw organizationError;
  }

  const organizationId = organizationRow.id;

  const { error: membershipError } = await adminClient.from("memberships").upsert(
    {
      organization_id: organizationId,
      user_id: data.user.id,
      invited_email: email,
      role: "owner",
      status: "active",
      created_by: data.user.id,
    },
    { onConflict: "organization_id,invited_email" },
  );

  if (membershipError) {
    throw membershipError;
  }

  await adminClient
    .from("profiles")
    .update({ default_organization_id: organizationId })
    .eq("user_id", data.user.id);

  await logOrganizationActivity({
    organizationId,
    actorUserId: data.user.id,
    activityType: "organization_created",
    title: `Utworzono organizację \"${organizationName}\"`,
    description: "Nowe konto organizatora zostało przygotowane i przypisane do organizacji.",
  });

  if (!data.session) {
    const signInResult = await supabase.auth.signInWithPassword({ email, password });

    if (signInResult.error) {
      redirect("/auth?registered=1");
    }
  }

  redirect("/admin");
};

export const inviteAdminAction = async (formData: FormData) => {
  const email = normalizeEmail(formData.get("email"));
  const role = parseRole(formData.get("role"));
  const sessionId = String(formData.get("sessionId") ?? "").trim() || null;

  if (!email) {
    redirect("/admin/organization?error=missing-email");
  }

  const { user, organization, membership } = await getAuthenticatedAdmin();

  if (membership.role === "moderator") {
    redirect("/admin/organization?error=forbidden");
  }

  const adminClient = createSupabaseAdminClient();
  let existingUserId: string | null = null;

  const listedUsers = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (!listedUsers.error) {
    existingUserId =
      listedUsers.data.users.find((candidate) => normalizeEmail(candidate.email) === email)?.id ?? null;
  }

  if (!existingUserId) {
    const inviteResult = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: getAdminInviteRedirectUrl(),
      data: {
        invitedBy: user.id,
        organizationId: organization.id,
        source: "flowa-organization-panel",
      },
    });

    if (inviteResult.error) {
      redirect("/admin/organization?error=invite-failed");
    }

    existingUserId = inviteResult.data.user?.id ?? null;
  }

  if (existingUserId) {
    await adminClient.from("profiles").upsert(
      {
        user_id: existingUserId,
        email,
        display_name: email.split("@")[0],
      },
      { onConflict: "user_id" },
    );
  }

  const membershipResult = await adminClient
    .from("memberships")
    .upsert(
    {
      organization_id: organization.id,
      user_id: existingUserId,
      invited_email: email,
      role,
      status: existingUserId ? "active" : "invited",
      created_by: user.id,
    },
    { onConflict: "organization_id,invited_email" },
  )
    .select("id, organization_id, user_id, invited_email, role, status, created_by, created_at, updated_at")
    .single();

  if (membershipResult.error || !membershipResult.data) {
    throw membershipResult.error;
  }

  if (sessionId) {
    const { error: collaboratorError } = await adminClient.from("session_collaborators").upsert(
      {
        session_id: sessionId,
        membership_id: membershipResult.data.id,
        role,
      },
      { onConflict: "session_id,membership_id" },
    );

    if (collaboratorError) {
      throw collaboratorError;
    }
  }

  await logOrganizationActivity({
    organizationId: organization.id,
    actorUserId: user.id,
    activityType: "member_invited",
    title: `Dodano współtwórcę ${email}`,
    description: sessionId
      ? "Użytkownik został przypisany do organizacji oraz do wybranej sesji."
      : "Użytkownik został przypisany do organizacji.",
    sessionId,
    metadata: {
      email,
      role,
      membershipId: membershipResult.data.id,
    },
  });

  redirect(`/admin/organization?invite=sent${sessionId ? `&sessionId=${sessionId}` : ""}`);
};

export const createSessionAction = async (formData: FormData) => {
  const { user, organization } = await getAuthenticatedAdmin();
  const defaultName = `Nowa sesja ${new Date().toLocaleDateString("pl-PL")}`;
  const name = String(formData.get("name") ?? defaultName).trim() || defaultName;
  const slug = await ensureUniqueSlug("sessions", name);
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("sessions")
    .insert({
      organization_id: organization.id,
      slug,
      name,
      description: "Sesja przygotowana w panelu Wojticore Flowa.",
      screen_time_limit_minutes: 60,
      age_mode: "variable",
      status: "active",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error;
  }

  await logOrganizationActivity({
    organizationId: organization.id,
    actorUserId: user.id,
    activityType: "session_created",
    title: `Utworzono sesję \"${name}\"`,
    description: "Nowa sesja została dodana do organizacji.",
    sessionId: data.id,
  });

  redirect(`/admin/sessions/${data.id}/settings?created=1`);
};

export const saveSessionSettingsAction = async (formData: FormData) => {
  const { user, organization } = await getAuthenticatedAdmin();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ageMode: SessionAgeMode =
    String(formData.get("ageMode") ?? "variable") === "fixed" ? "fixed" : "variable";
  const fixedAge = ageMode === "fixed" ? parsePositiveNumber(formData.get("fixedAge"), 18) : null;
  const limitMinutes = Math.min(parsePositiveNumber(formData.get("limitMinutes"), 60), 1440);
  const collaboratorMembershipIds = formData
    .getAll("collaboratorMembershipIds")
    .map((value) => String(value))
    .filter(Boolean);

  if (!name) {
    redirect(sessionId ? `/admin/sessions/${sessionId}/settings?error=missing-name` : "/admin/sessions/new?error=missing-name");
  }

  const adminClient = createSupabaseAdminClient();
  const basePayload = {
    organization_id: organization.id,
    name,
    description,
    screen_time_limit_minutes: limitMinutes,
    age_mode: ageMode,
    fixed_age: fixedAge,
  };

  const insertPayload: SessionInsert = {
    ...basePayload,
    slug: await ensureUniqueSlug("sessions", name),
    status: "active",
    created_by: user.id,
  };

  const updatePayload: SessionUpdate = basePayload;

  const sessionResult = sessionId
    ? await adminClient
        .from("sessions")
        .update(updatePayload)
        .eq("id", sessionId)
        .eq("organization_id", organization.id)
        .select("id")
        .single()
    : await adminClient
        .from("sessions")
        .insert(insertPayload)
        .select("id")
        .single();

  if (sessionResult.error || !sessionResult.data?.id) {
    throw sessionResult.error;
  }

  const resolvedSessionId = sessionResult.data.id;

  const { error: deleteCollaboratorsError } = await adminClient
    .from("session_collaborators")
    .delete()
    .eq("session_id", resolvedSessionId);

  if (deleteCollaboratorsError) {
    throw deleteCollaboratorsError;
  }

  if (collaboratorMembershipIds.length) {
    const collaboratorRows: SessionCollaboratorInsert[] = collaboratorMembershipIds.map(
      (membershipId) => ({
        session_id: resolvedSessionId,
        membership_id: membershipId,
        role: "moderator",
      }),
    );

    const { error: collaboratorInsertError } = await adminClient
      .from("session_collaborators")
      .insert(collaboratorRows);

    if (collaboratorInsertError) {
      throw collaboratorInsertError;
    }
  }

  await logOrganizationActivity({
    organizationId: organization.id,
    actorUserId: user.id,
    activityType: sessionId ? "session_updated" : "session_created",
    title: `${sessionId ? "Zaktualizowano" : "Utworzono"} sesję \"${name}\"`,
    description: "Parametry sesji zostały zapisane.",
    sessionId: resolvedSessionId,
  });

  redirect(`/admin/sessions/${resolvedSessionId}/settings?saved=1`);
};

export const deleteSessionAction = async (formData: FormData) => {
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const { user, organization } = await getAuthenticatedAdmin();

  if (!sessionId) {
    redirect("/admin/sessions?error=missing-session");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: sessionRow } = await adminClient
    .from("sessions")
    .select("id, name")
    .eq("id", sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  const { error } = await adminClient
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("organization_id", organization.id);

  if (error) {
    throw error;
  }

  await logOrganizationActivity({
    organizationId: organization.id,
    actorUserId: user.id,
    activityType: "session_deleted",
    title: `Usunięto sesję \"${sessionRow?.name ?? "Sesja"}\"`,
    description: "Sesja została usunięta z organizacji.",
  });

  redirect("/admin/sessions?deleted=1");
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
    redirect("/auth?error=session-expired");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/admin/setup-password?error=update-failed");
  }

  await activatePendingMemberships(user);
  await ensureProfileForUser(user);

  redirect("/admin?password=updated");
};