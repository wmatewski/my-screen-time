import "server-only";

import { publicEnv } from "@/lib/env/public";

const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const serverEnv = {
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
  },
  get adminInviteRedirectUrl() {
    return (
      process.env.ADMIN_INVITE_REDIRECT_URL ??
      `${publicEnv.appUrl}/auth/callback?next=/admin/setup-password`
    );
  },
  get userInviteRedirectUrl() {
    return (
      process.env.USER_INVITE_REDIRECT_URL ??
      `${publicEnv.appUrl}/auth/callback?next=/account/setup-password`
    );
  },
} as const;
