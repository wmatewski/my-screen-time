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

export const submitScreenTimeAction = async (formData: FormData) => {
  const hours = parseBoundedNumber(formData.get("hours"));
  const minutes = parseBoundedNumber(formData.get("minutes"));
  const totalMinutes = hours * 60 + minutes;

  if (hours > 23 || minutes > 59 || totalMinutes <= 0 || totalMinutes > 1440) {
    redirect("/?error=invalid-time");
  }

  const headerStore = await headers();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(publicEnv.sessionCookieName)?.value;

  if (!sessionId) {
    sessionId = createSessionId();
    cookieStore.set(publicEnv.sessionCookieName, sessionId, sessionCookieOptions);
  }

  const submittedOperatingSystem = String(formData.get("operatingSystem") ?? "unknown");
  const detectedOperatingSystem = detectOperatingSystem(headerStore.get("user-agent"));
  const operatingSystem = isOperatingSystem(submittedOperatingSystem)
    ? submittedOperatingSystem
    : detectedOperatingSystem;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("screen_time_entries").insert({
    session_id: sessionId,
    screen_time_minutes: totalMinutes,
    detected_os: operatingSystem,
    ip_address: getClientIp(headerStore),
    user_agent: headerStore.get("user-agent"),
  });

  if (error) {
    redirect("/?error=save-failed");
  }

  redirect("/?saved=1");
};