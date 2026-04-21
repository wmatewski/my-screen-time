"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env/public";
import { detectOperatingSystem, isOperatingSystem } from "@/lib/os";
import { getClientIp } from "@/lib/request";
import { createSessionId, sessionCookieOptions } from "@/lib/session";

const parseBoundedNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const getSafeRedirectTarget = (value: FormDataEntryValue | null) => {
  const redirectTarget = String(value ?? "/");

  return redirectTarget.startsWith("/") ? redirectTarget : "/";
};

export const submitScreenTimeAction = async (formData: FormData) => {
  const hours = parseBoundedNumber(formData.get("hours"));
  const minutes = parseBoundedNumber(formData.get("minutes"));
  const totalMinutes = hours * 60 + minutes;
  const redirectTarget = getSafeRedirectTarget(formData.get("redirectTo"));

  if (hours > 23 || minutes > 59 || totalMinutes <= 0 || totalMinutes > 1440) {
    redirect(`${redirectTarget}?error=invalid-time`);
  }

  const headerStore = await headers();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(publicEnv.sessionCookieName)?.value;

  if (!sessionId) {
    sessionId = createSessionId();
    cookieStore.set(publicEnv.sessionCookieName, sessionId, sessionCookieOptions);
  }

  const submittedOperatingSystem = String(formData.get("operatingSystem") ?? "").trim();
  const detectedOperatingSystem = detectOperatingSystem(headerStore.get("user-agent"));
  const operatingSystem =
    submittedOperatingSystem && submittedOperatingSystem !== "unknown" && isOperatingSystem(submittedOperatingSystem)
    ? submittedOperatingSystem
    : detectedOperatingSystem;
  const trackedSessionId = String(formData.get("trackedSessionId") ?? "").trim() || null;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("screen_time_entries").insert({
    tracked_session_id: trackedSessionId,
    session_id: sessionId,
    screen_time_minutes: totalMinutes,
    detected_os: operatingSystem,
    ip_address: getClientIp(headerStore),
    user_agent: headerStore.get("user-agent"),
  });

  if (error) {
    redirect(`${redirectTarget}?error=save-failed`);
  }

  redirect(`${redirectTarget}?saved=1`);
};
