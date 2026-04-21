"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export const SessionLiveUpdates = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`session-live-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "screentime",
          table: "screen_time_entries",
          filter: `tracked_session_id=eq.${sessionId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, sessionId]);

  return <p className="saas-muted">Supabase Realtime odświeża ten widok po każdym nowym wpisie.</p>;
};
