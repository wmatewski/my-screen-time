import "server-only";

import QRCode from "qrcode";

import { publicEnv } from "@/lib/env/public";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AdminDashboardData,
  AdminProfile,
  IpStatistic,
  OperatingSystemSummary,
  OrganizationMembership,
  OrganizationMember,
  ScreenTimeEntry,
  SessionPanelData,
  SharedSessionData,
  TrackedSessionSummary,
  UserDashboardData,
  UserProfile,
} from "@/lib/types";

const average = (values: number[]) => {
  if (!values.length) {
    return null;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

const SHORT_CODE_LENGTH = 7;
const SESSION_STATISTICS_FIELDS =
  "id, organization_id, created_by, name, slug, description, age_group, max_participants, created_at, updated_at, submissions, average_minutes, last_submission_at, participants";
const buildShareUrl = (sessionId: string) => `${publicEnv.appUrl}/session/${sessionId}`;
const buildShortCode = (sessionId: string) => sessionId.slice(0, SHORT_CODE_LENGTH);
const buildShortShareUrl = (sessionId: string) => `${publicEnv.appUrl}/${buildShortCode(sessionId)}`;

const enrichSessionSummary = async (
  item: Omit<TrackedSessionSummary, "share_url" | "short_share_url" | "short_code" | "qr_code_data_url">,
): Promise<TrackedSessionSummary> => {
  const shortShareUrl = buildShortShareUrl(item.id);

  return {
    ...item,
    share_url: buildShareUrl(item.id),
    short_share_url: shortShareUrl,
    short_code: buildShortCode(item.id),
    qr_code_data_url: await QRCode.toDataURL(shortShareUrl, {
      margin: 1,
      width: 220,
    }),
  };
};

export const getSessionIdFromShortCode = async (shortCode: string) => {
  const normalizedShortCode = shortCode.trim().toLowerCase();

  if (!new RegExp(`^[a-f0-9]{${SHORT_CODE_LENGTH}}$`).test(normalizedShortCode)) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tracked_sessions")
    .select("id")
    .ilike("id", `${normalizedShortCode}%`)
    .limit(2);

  if (error) {
    throw error;
  }

  if (!data || data.length !== 1) {
    return null;
  }

  return data[0]?.id ?? null;
};

export const getUserExperienceData = async (sessionId: string) => {
  const supabase = createSupabaseAdminClient();

  const [latestEntryResult, recentEntriesResult, participantEntriesResult] = await Promise.all([
    sessionId
      ? supabase
          .from("screen_time_entries")
          .select(
            "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
          )
          .eq("session_id", sessionId)
          .is("tracked_session_id", null)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    sessionId
      ? supabase
          .from("screen_time_entries")
          .select(
            "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
          )
          .eq("session_id", sessionId)
          .is("tracked_session_id", null)
          .order("submitted_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("latest_session_entries")
      .select(
        "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
      )
      .is("tracked_session_id", null)
      .order("submitted_at", { ascending: false })
      .limit(1000),
  ]);

  if (latestEntryResult.error) {
    throw latestEntryResult.error;
  }

  if (recentEntriesResult.error) {
    throw recentEntriesResult.error;
  }

  if (participantEntriesResult.error) {
    throw participantEntriesResult.error;
  }

  return {
    latestEntry: (latestEntryResult.data as ScreenTimeEntry | null) ?? null,
    recentEntries: (recentEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    participantEntries: (participantEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
  };
};

export const getSharedSessionData = async (
  sessionId: string,
  participantSessionId: string,
): Promise<SharedSessionData | null> => {
  const supabase = createSupabaseAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from("tracked_sessions")
    .select(
      "id, organization_id, created_by, name, slug, description, age_group, max_participants, created_at, updated_at",
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return null;
  }

  const [ownerResult, latestEntryResult, recentEntriesResult, participantEntriesResult, publicEntriesResult] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("user_id, email, full_name, created_at, updated_at")
        .eq("user_id", session.created_by)
        .maybeSingle(),
      participantSessionId
        ? supabase
            .from("screen_time_entries")
            .select(
              "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
            )
            .eq("tracked_session_id", session.id)
            .eq("session_id", participantSessionId)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      participantSessionId
        ? supabase
            .from("screen_time_entries")
            .select(
              "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
            )
            .eq("tracked_session_id", session.id)
            .eq("session_id", participantSessionId)
            .order("submitted_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("latest_session_entries")
        .select(
          "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
        )
        .eq("tracked_session_id", session.id)
        .order("submitted_at", { ascending: false })
        .limit(1000),
      supabase
        .from("screen_time_entries")
        .select(
          "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
        )
        .eq("tracked_session_id", session.id)
        .order("submitted_at", { ascending: false })
        .limit(8),
    ]);

  if (ownerResult.error) {
    throw ownerResult.error;
  }

  if (latestEntryResult.error) {
    throw latestEntryResult.error;
  }

  if (recentEntriesResult.error) {
    throw recentEntriesResult.error;
  }

  if (participantEntriesResult.error) {
    throw participantEntriesResult.error;
  }

  if (publicEntriesResult.error) {
    throw publicEntriesResult.error;
  }

  return {
    session,
    owner: (ownerResult.data as UserProfile | null) ?? null,
    latestEntry: (latestEntryResult.data as ScreenTimeEntry | null) ?? null,
    recentEntries: (recentEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    participantEntries: (participantEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    publicEntries: (publicEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
  };
};

export const getSessionPanelData = async ({
  sessionId,
  participantSessionId,
}: {
  sessionId: string;
  participantSessionId: string;
}): Promise<SessionPanelData | null> => {
  const supabase = createSupabaseAdminClient();
  const { data: sessionStats, error: sessionError } = await supabase
    .from("session_statistics")
    .select(SESSION_STATISTICS_FIELDS)
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!sessionStats) {
    return null;
  }

  const [ownerResult, latestParticipantEntryResult, participantEntriesResult, liveEntriesResult, reportEntriesResult] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("user_id, email, full_name, created_at, updated_at")
        .eq("user_id", sessionStats.created_by)
        .maybeSingle(),
      participantSessionId
        ? supabase
            .from("screen_time_entries")
            .select(
              "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
            )
            .eq("tracked_session_id", sessionId)
            .eq("session_id", participantSessionId)
            .order("submitted_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      participantSessionId
        ? supabase
            .from("screen_time_entries")
            .select(
              "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
            )
            .eq("tracked_session_id", sessionId)
            .eq("session_id", participantSessionId)
            .order("submitted_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("latest_session_entries")
        .select(
          "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
        )
        .eq("tracked_session_id", sessionId)
        .order("submitted_at", { ascending: false })
        .limit(12),
      supabase
        .from("screen_time_entries")
        .select(
          "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
        )
        .eq("tracked_session_id", sessionId)
        .order("submitted_at", { ascending: false })
        .limit(100),
    ]);

  if (ownerResult.error) {
    throw ownerResult.error;
  }

  if (latestParticipantEntryResult.error) {
    throw latestParticipantEntryResult.error;
  }

  if (participantEntriesResult.error) {
    throw participantEntriesResult.error;
  }

  if (liveEntriesResult.error) {
    throw liveEntriesResult.error;
  }

  if (reportEntriesResult.error) {
    throw reportEntriesResult.error;
  }

  return {
    session: await enrichSessionSummary(sessionStats as Omit<TrackedSessionSummary, "share_url" | "short_share_url" | "short_code" | "qr_code_data_url">),
    owner: (ownerResult.data as UserProfile | null) ?? null,
    latestParticipantEntry: (latestParticipantEntryResult.data as ScreenTimeEntry | null) ?? null,
    participantEntries: (participantEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    liveEntries: (liveEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    reportEntries: (reportEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
  };
};

export const getUserDashboardData = async ({
  userId,
  organizationId,
  profile,
  membership,
  organization,
}: {
  userId: string;
  organizationId: string;
  profile: UserProfile;
  membership: OrganizationMembership;
  organization: UserDashboardData["organization"];
}): Promise<UserDashboardData> => {
  const supabase = createSupabaseAdminClient();
  const [trackedSessionsResult, membershipsResult] = await Promise.all([
    supabase
      .from("session_statistics")
      .select(SESSION_STATISTICS_FIELDS)
      .eq("organization_id", organizationId)
      .eq("created_by", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("organization_memberships")
      .select("id, organization_id, user_id, role, status, created_at, updated_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
  ]);

  if (trackedSessionsResult.error) {
    throw trackedSessionsResult.error;
  }

  if (membershipsResult.error) {
    throw membershipsResult.error;
  }

  const trackedSessionsRaw = (trackedSessionsResult.data as Omit<TrackedSessionSummary, "share_url" | "short_share_url" | "short_code" | "qr_code_data_url">[] | null) ?? [];
  const memberships = (membershipsResult.data as OrganizationMembership[] | null) ?? [];
  const memberIds = memberships.map((member) => member.user_id);
  const sessionIds = trackedSessionsRaw.map((item) => item.id);

  const [profilesResult, recentEntriesResult] = await Promise.all([
    memberIds.length
      ? supabase
          .from("user_profiles")
          .select("user_id, email, full_name, created_at, updated_at")
          .in("user_id", memberIds)
      : Promise.resolve({ data: [], error: null }),
    sessionIds.length
      ? supabase
          .from("screen_time_entries")
          .select(
            "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
          )
          .in("tracked_session_id", sessionIds)
          .order("submitted_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (recentEntriesResult.error) {
    throw recentEntriesResult.error;
  }

  const profiles = ((profilesResult.data as UserProfile[] | null) ?? []).reduce<Record<string, UserProfile>>(
    (accumulator, item) => {
      accumulator[item.user_id] = item;
      return accumulator;
    },
    {},
  );

  const trackedSessions = await Promise.all(trackedSessionsRaw.map((item) => enrichSessionSummary(item)));

  return {
    profile,
    organization,
    membership,
    trackedSessions,
    organizationMembers: memberships.map((member) => ({
      ...member,
      profile: profiles[member.user_id] ?? null,
    })) as OrganizationMember[],
    recentEntries: (recentEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
  };
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    totalSubmissionsResult,
    todaySubmissionsResult,
    latestParticipantsResult,
    osStatisticsResult,
    ipStatisticsResult,
    recentEntriesResult,
    adminProfilesResult,
  ] = await Promise.all([
    supabase.from("screen_time_entries").select("id", { count: "exact", head: true }),
    supabase
      .from("screen_time_entries")
      .select("id", { count: "exact", head: true })
      .eq("entry_date", today),
    supabase
      .from("latest_session_entries")
      .select(
        "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
      )
      .order("submitted_at", { ascending: false })
      .limit(1000),
    supabase
      .from("os_statistics")
      .select("detected_os, participants, average_minutes, minimum_minutes, maximum_minutes")
      .order("participants", { ascending: false }),
    supabase
      .from("ip_statistics")
      .select("ip_address, submissions, last_seen, average_minutes")
      .order("submissions", { ascending: false })
      .limit(10),
    supabase
      .from("screen_time_entries")
      .select(
        "id, tracked_session_id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
      )
      .order("submitted_at", { ascending: false })
      .limit(20),
    supabase
      .from("admin_profiles")
      .select("user_id, email, role, status, invited_by, created_at, updated_at")
      .order("created_at", { ascending: true }),
  ]);

  if (latestParticipantsResult.error) {
    throw latestParticipantsResult.error;
  }

  if (osStatisticsResult.error) {
    throw osStatisticsResult.error;
  }

  if (ipStatisticsResult.error) {
    throw ipStatisticsResult.error;
  }

  if (recentEntriesResult.error) {
    throw recentEntriesResult.error;
  }

  if (adminProfilesResult.error) {
    throw adminProfilesResult.error;
  }

  const latestParticipants = (latestParticipantsResult.data as ScreenTimeEntry[] | null) ?? [];

  return {
    totalParticipants: latestParticipants.length,
    totalSubmissions: totalSubmissionsResult.count ?? 0,
    todaySubmissions: todaySubmissionsResult.count ?? 0,
    overallAverageMinutes: average(latestParticipants.map((entry) => entry.screen_time_minutes)),
    osStatistics: (osStatisticsResult.data as OperatingSystemSummary[] | null) ?? [],
    ipStatistics: (ipStatisticsResult.data as IpStatistic[] | null) ?? [],
    recentEntries: (recentEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    adminProfiles: (adminProfilesResult.data as AdminProfile[] | null) ?? [],
  };
};
