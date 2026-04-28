import { publicEnv } from "@/lib/env/public";

export const createSessionId = () => crypto.randomUUID();

const baseCookieOptions = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  ...(publicEnv.projectDomain ? { domain: publicEnv.projectDomain } : {}),
};

export const sessionCookieOptions = {
  ...baseCookieOptions,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365,
};

export const supabaseAuthCookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 365,
};

export const sessionCookieName = publicEnv.sessionCookieName;
