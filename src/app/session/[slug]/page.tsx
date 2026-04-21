import { Activity, QrCode, Users } from "lucide-react";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { submitScreenTimeAction } from "@/app/actions";
import { LiveRefresh } from "@/components/user/live-refresh";
import { ScreenTimeExperience } from "@/components/user/screen-time-experience";
import { buildSessionAnalytics } from "@/lib/analytics";
import { getSharedSessionData } from "@/lib/data";
import { publicEnv } from "@/lib/env/public";
import { formatDateTime, formatMinutes } from "@/lib/format";
import { detectOperatingSystem } from "@/lib/os";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "saved") {
    return {
      type: "success",
      message: "Wynik został zapisany do tej współdzielonej sesji.",
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

export default async function SharedSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, queryParams, cookieStore, headerStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
    headers(),
  ]);
  const sessionId = cookieStore.get(publicEnv.sessionCookieName)?.value ?? "";
  const detectedOperatingSystem = detectOperatingSystem(headerStore.get("user-agent"));
  const data = await getSharedSessionData(slug, sessionId);

  if (!data) {
    notFound();
  }

  const analytics = buildSessionAnalytics({
    latestEntry: data.latestEntry,
    participantEntries: data.participantEntries,
    sessionEntries: data.recentEntries,
  });
  const flash = getFlashMessage(
    queryParams.error
      ? String(queryParams.error)
      : queryParams.saved
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
            <strong>{data.session.name}</strong>
            <span>{data.owner?.full_name ?? data.owner?.email ?? "Sesja użytkownika"}</span>
          </div>
        </div>

        <div className="eyebrow">
          <QrCode size={16} />
          Publiczny link sesji
        </div>
      </header>

      <ScreenTimeExperience
        initialOperatingSystem={detectedOperatingSystem}
        latestEntry={data.latestEntry}
        recentEntries={data.recentEntries}
        analytics={analytics}
        flash={flash}
        submitAction={submitScreenTimeAction}
        trackedSessionId={data.session.id}
        redirectTo={`/session/${data.session.slug}`}
        heroEyebrow="Sesja współdzielona"
        heroTitle={data.session.name}
        heroDescription={
          data.session.description ||
          "Wpisz swój dzisiejszy czas przed ekranem. Wyniki zostaną przypisane do tej sesji i odświeżą panel właściciela."
        }
        sessionChipLabel={`Organizacja: ${data.owner?.full_name ?? data.owner?.email ?? "Aura Clarity"}`}
        footerText="Ta strona zapisuje wynik do konkretnej współdzielonej sesji. W tej samej przeglądarce zobaczysz swoją historię wpisów dla tego linku."
      />

      <section className="table-card" style={{ marginTop: 20 }}>
        <div className="card-title-row">
          <div>
            <div className="eyebrow">Live data</div>
            <h2 className="card-title" style={{ marginTop: 12 }}>
              Ostatnie wpisy w tej sesji
            </h2>
          </div>
          <div className="icon-bubble">
            <Users />
          </div>
        </div>

        <LiveRefresh />

        {data.publicEntries.length ? (
          <div className="list-grid" style={{ marginTop: 16 }}>
            {data.publicEntries.map((entry) => (
              <article key={entry.id} className="recent-entry">
                <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                <div className="entry-meta">
                  <span>{entry.detected_os}</span>
                  <span>{formatDateTime(entry.submitted_at)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Brak wpisów w tej sesji.</strong>
            <span>Udostępnij link dalej, aby zobaczyć pierwsze dane na żywo.</span>
          </div>
        )}
      </section>
    </main>
  );
}
