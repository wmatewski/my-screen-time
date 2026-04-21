import "server-only";

import { publicEnv } from "@/lib/env/public";

const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const serverEnv = {
  supabaseSecretKey: required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY),
  adminInviteRedirectUrl:
    process.env.ADMIN_INVITE_REDIRECT_URL ??
    `${publicEnv.appUrl}/auth/callback?next=/admin/setup-password`,
  userInviteRedirectUrl:
    process.env.USER_INVITE_REDIRECT_URL ??
    `${publicEnv.appUrl}/auth/callback?next=/account/setup-password`,
} as const;
