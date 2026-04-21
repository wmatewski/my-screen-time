"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const LiveRefresh = ({ seconds = 20 }: { seconds?: number }) => {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, seconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [router, seconds]);

  return <p className="muted">Auto-odświeżanie danych co {seconds} sekund.</p>;
};
