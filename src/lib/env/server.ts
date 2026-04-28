import "server-only";

import { publicEnv } from "@/lib/env/public";

const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getSupabaseSecretKey = () =>
  required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

export const getAdminInviteRedirectUrl = () =>
  process.env.ADMIN_INVITE_REDIRECT_URL ??
  `${publicEnv.appUrl}/auth/callback?next=/admin/setup-password`;

export const getUserInviteRedirectUrl = () =>
  process.env.USER_INVITE_REDIRECT_URL ??
  `${publicEnv.appUrl}/auth/callback?next=/password-reset`;

export const getPasswordResetRedirectUrl = () =>
  process.env.PASSWORD_RESET_REDIRECT_URL ??
  `${publicEnv.appUrl}/auth/callback?next=/password-reset`;
