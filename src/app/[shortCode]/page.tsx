import { notFound, redirect } from "next/navigation";

import { getSessionIdFromShortCode } from "@/lib/data";

export default async function SessionShortLinkPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;
  const sessionId = await getSessionIdFromShortCode(shortCode);

  if (!sessionId) {
    notFound();
  }

  redirect(`/session/${sessionId}`);
}
