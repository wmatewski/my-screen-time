import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AdminDashboardData,
  AdminProfile,
  IpStatistic,
  OperatingSystemSummary,
  ScreenTimeEntry,
} from "@/lib/types";

const average = (values: number[]) => {
  if (!values.length) {
    return null;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

export const getUserExperienceData = async (sessionId: string) => {
  const supabase = createSupabaseAdminClient();

  const [latestEntryResult, recentEntriesResult, participantEntriesResult] = await Promise.all([
    sessionId
      ? supabase
          .from("screen_time_entries")
          .select(
            "id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
          )
          .eq("session_id", sessionId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    sessionId
      ? supabase
          .from("screen_time_entries")
          .select(
            "id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
          )
          .eq("session_id", sessionId)
          .order("submitted_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("latest_session_entries")
      .select(
        "id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
      )
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
    participantEntries:
      (participantEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
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
        "id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
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
        "id, session_id, screen_time_minutes, detected_os, ip_address, user_agent, submitted_at, entry_date",
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

  const latestParticipants =
    (latestParticipantsResult.data as ScreenTimeEntry[] | null) ?? [];

  return {
    totalParticipants: latestParticipants.length,
    totalSubmissions: totalSubmissionsResult.count ?? 0,
    todaySubmissions: todaySubmissionsResult.count ?? 0,
    overallAverageMinutes: average(
      latestParticipants.map((entry) => entry.screen_time_minutes),
    ),
    osStatistics:
      (osStatisticsResult.data as OperatingSystemSummary[] | null) ?? [],
    ipStatistics:
      (ipStatisticsResult.data as IpStatistic[] | null) ?? [],
    recentEntries:
      (recentEntriesResult.data as ScreenTimeEntry[] | null) ?? [],
    adminProfiles:
      (adminProfilesResult.data as AdminProfile[] | null) ?? [],
  };
};