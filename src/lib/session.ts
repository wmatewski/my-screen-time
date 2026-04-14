import { publicEnv } from "@/lib/env/public";

export const createSessionId = () => crypto.randomUUID();

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export const sessionCookieName = publicEnv.sessionCookieName;