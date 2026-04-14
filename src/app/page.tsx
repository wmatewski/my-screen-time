import { Activity, ShieldCheck } from "lucide-react";
import { cookies, headers } from "next/headers";

import { submitScreenTimeAction } from "@/app/actions";
import { ScreenTimeExperience } from "@/components/user/screen-time-experience";
import { buildSessionAnalytics } from "@/lib/analytics";
import { getUserExperienceData } from "@/lib/data";
import { publicEnv } from "@/lib/env/public";
import { detectOperatingSystem } from "@/lib/os";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "saved") {
    return {
      type: "success",
      message: "Wynik został zapisany i przypisany do bieżącej lokalnej sesji.",
    };
  }

  if (code === "invalid-time") {
    return {
      type: "error",
      message: "Podaj poprawny czas w zakresie od 1 minuty do 23 godzin 59 minut.",
    };
  }

  if (code === "save-failed") {
    return {
      type: "error",
      message: "Nie udało się zapisać wyniku w bazie danych. Sprawdź konfigurację Supabase.",
    };
  }

  return null;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const sessionId = cookieStore.get(publicEnv.sessionCookieName)?.value ?? "";
  const detectedOperatingSystem = detectOperatingSystem(headerStore.get("user-agent"));
  const { latestEntry, recentEntries, participantEntries } = await getUserExperienceData(
    sessionId,
  );
  const analytics = buildSessionAnalytics({
    latestEntry,
    participantEntries,
    sessionEntries: recentEntries,
  });
  const flash = getFlashMessage(
    params.error
      ? String(params.error)
      : params.saved
        ? "saved"
        : undefined,
  );

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={22} />
          </div>
          <div className="brand-copy">
            <strong>Aura Clarity</strong>
            <span>Twoja jasna analiza dnia</span>
          </div>
        </div>

        <div className="eyebrow">
          <ShieldCheck size={16} />
          Sesja lokalna bez logowania
        </div>
      </header>

      <ScreenTimeExperience
        initialOperatingSystem={detectedOperatingSystem}
        latestEntry={latestEntry}
        recentEntries={recentEntries}
        analytics={analytics}
        flash={flash}
        submitAction={submitScreenTimeAction}
      />

      <footer className="page-footer" style={{ marginTop: 20 }}>
        Dane użytkownika są wiązane z lokalną sesją cookie, a nie z kontem. Dzięki temu możesz
        wracać do swoich wpisów w tej samej przeglądarce bez rejestracji.
      </footer>
    </main>
  );
}