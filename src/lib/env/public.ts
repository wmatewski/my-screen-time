const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const recommendedDailyLimitMinutes = Number(
  process.env.NEXT_PUBLIC_RECOMMENDED_DAILY_LIMIT_MINUTES ?? "120",
);

const normalizeProjectDomain = (value: string | undefined) =>
  value
    ?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/\/.*$/, "") ?? "";

const projectDomain = normalizeProjectDomain(process.env.NEXT_PUBLIC_PROJECT_DOMAIN);

export const publicEnv = {
  appUrl: projectDomain
    ? `https://${projectDomain}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  projectDomain: projectDomain || null,
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  sessionCookieName: process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "st_session_id",
  recommendedDailyLimitMinutes: Number.isNaN(recommendedDailyLimitMinutes)
    ? 120
    : recommendedDailyLimitMinutes,
} as const;
