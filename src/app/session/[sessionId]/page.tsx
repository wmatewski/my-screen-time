import { Activity, ArrowUpRight, Clock3, Copy, Link2, Orbit, QrCode, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { submitScreenTimeAction } from "@/app/actions";
import { SessionLiveUpdates } from "@/components/session/session-live-updates";
import { SessionTabNav } from "@/components/session/session-tab-nav";
import { getOptionalAuthenticatedAppUser } from "@/lib/app-auth";
import { getDeviceLabel } from "@/lib/device";
import { getSessionPanelData, getSharedSessionData } from "@/lib/data";
import { publicEnv } from "@/lib/env/public";
import { formatDateTime, formatMinutes } from "@/lib/format";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.created === "1") {
    return { type: "success", message: "Sesja została utworzona. Poniżej masz QR, linki i live statystyki." };
  }

  if (params.saved === "1") {
    return { type: "success", message: "Wpis został zapisany do tej sesji." };
  }

  if (params.error === "invalid-time") {
    return { type: "error", message: "Podaj poprawny czas w zakresie od 1 minuty do 23 godzin 59 minut." };
  }

  if (params.error === "save-failed") {
    return { type: "error", message: "Nie udało się zapisać wpisu." };
  }

  return null;
};

const averageMinutes = (values: number[]) => {
  if (!values.length) {
    return null;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
};

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ sessionId }, query, cookieStore, auth] = await Promise.all([
    params,
    searchParams,
    cookies(),
    getOptionalAuthenticatedAppUser(),
  ]);
  const participantSessionId = cookieStore.get(publicEnv.sessionCookieName)?.value ?? "";
  const sharedData = await getSharedSessionData(sessionId, participantSessionId);

  if (!sharedData) {
    notFound();
  }

  const flash = getFlashMessage(query);
  const isWorkspaceView = Boolean(
    auth && auth.membership.status === "active" && auth.organization.id === sharedData.session.organization_id,
  );

  if (isWorkspaceView) {
    const panelData = await getSessionPanelData({ sessionId, participantSessionId });

    if (!panelData) {
      notFound();
    }

    const activeTab = query.tab === "report" ? "report" : "overview";
    const participationRatio = Math.min(
      100,
      Math.round((panelData.session.participants / panelData.session.max_participants) * 100),
    );

    return (
      <main className="saas-dashboard-shell saas-session-shell">
        <aside className="saas-sidebar saas-session-sidebar">
          <div className="saas-sidebar-top">
            <Link href="/dashboard/sessions" className="saas-logo-row">
              <div className="saas-logo-mark">
                <Orbit size={20} />
              </div>
              <div>
                <strong>Wojticore Flowa</strong>
                <p>Session workspace</p>
              </div>
            </Link>

            <div className="saas-session-sidebar-card">
              <span className="saas-section-label">Sesja</span>
              <h2>{panelData.session.name}</h2>
              <p>{panelData.session.description || "Minimalistyczny panel sesji z live overview i raportem."}</p>
            </div>

            <SessionTabNav sessionId={panelData.session.id} activeTab={activeTab} />
          </div>

          <div className="saas-sidebar-bottom">
            <div className="saas-sidebar-summary">
              <span>Krótki link</span>
              <strong>{panelData.session.short_share_url}</strong>
              <p>QR i oba linki znajdziesz też w overview.</p>
            </div>
          </div>
        </aside>

        <section className="saas-dashboard-content">
          {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}
          <section className="saas-page-header">
            <div>
              <span className="saas-pill">Panel sesji</span>
              <h1>{panelData.session.name}</h1>
              <p className="saas-lead">
                Kategoria {panelData.session.age_group}, właściciel {panelData.owner?.full_name ?? panelData.owner?.email ?? "Nieznany"}.
              </p>
            </div>
            <SessionLiveUpdates sessionId={panelData.session.id} />
          </section>

          {activeTab === "overview" ? (
            <>
              <section className="saas-metric-grid">
                <article className="saas-metric-card">
                  <span>Uczestnicy</span>
                  <strong>{panelData.session.participants}</strong>
                  <p>{participationRatio}% z limitu {panelData.session.max_participants} osób.</p>
                </article>
                <article className="saas-metric-card">
                  <span>Wpisy</span>
                  <strong>{panelData.session.submissions}</strong>
                  <p>Łączna liczba zapisów w tej sesji.</p>
                </article>
                <article className="saas-metric-card">
                  <span>Średni czas</span>
                  <strong>{formatMinutes(panelData.session.average_minutes)}</strong>
                  <p>Średnia wyliczona ze wszystkich wpisów.</p>
                </article>
                <article className="saas-metric-card">
                  <span>Ostatnia aktywność</span>
                  <strong>{panelData.session.last_submission_at ? formatDateTime(panelData.session.last_submission_at) : "Brak"}</strong>
                  <p>Automatycznie odświeżane przez Supabase Realtime.</p>
                </article>
              </section>

              <section className="saas-dashboard-grid">
                <article className="saas-panel-card">
                  <div className="saas-card-head">
                    <div>
                      <span className="saas-section-label">Udostępnianie</span>
                      <h2>Linki i kod QR</h2>
                    </div>
                    <QrCode size={18} />
                  </div>
                  <div className="saas-link-stack">
                    <a className="saas-inline-link" href={panelData.session.share_url} target="_blank" rel="noreferrer">
                      <Link2 size={16} />
                      {panelData.session.share_url}
                    </a>
                    <a className="saas-inline-link" href={panelData.session.short_share_url} target="_blank" rel="noreferrer">
                      <ArrowUpRight size={16} />
                      {panelData.session.short_share_url}
                    </a>
                    <div className="saas-copy-chip">
                      <Copy size={14} />
                      Kod skrótu: {panelData.session.short_code}
                    </div>
                  </div>
                  <div className="saas-qr-card saas-qr-card-large">
                    <Image src={panelData.session.qr_code_data_url} alt={`QR ${panelData.session.name}`} width={220} height={220} unoptimized />
                  </div>
                </article>

                <article className="saas-panel-card">
                  <div className="saas-card-head">
                    <div>
                      <span className="saas-section-label">Live overview</span>
                      <h2>Ostatni uczestnicy</h2>
                    </div>
                    <Users size={18} />
                  </div>
                  <div className="saas-list-grid">
                    {panelData.liveEntries.length ? (
                      panelData.liveEntries.map((entry) => (
                        <article key={entry.id} className="saas-list-item">
                          <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                          <p>
                            {entry.detected_os} · {formatDateTime(entry.submitted_at)}
                          </p>
                        </article>
                      ))
                    ) : (
                      <div className="saas-empty-state">
                        <strong>Brak live danych.</strong>
                        <p>Udostępnij link i poczekaj na pierwszy wpis.</p>
                      </div>
                    )}
                  </div>
                </article>
              </section>
            </>
          ) : (
            <section className="saas-panel-card">
              <div className="saas-card-head">
                <div>
                  <span className="saas-section-label">Raport</span>
                  <h2>Dokładne logi uczestników</h2>
                </div>
                <Activity size={18} />
              </div>
              <div className="saas-report-table">
                <div className="saas-report-head">
                  <span>Godzina</span>
                  <span>IP</span>
                  <span>Urządzenie</span>
                  <span>Czas</span>
                </div>
                {panelData.reportEntries.length ? (
                  panelData.reportEntries.map((entry) => (
                    <div key={entry.id} className="saas-report-row">
                      <span>{formatDateTime(entry.submitted_at)}</span>
                      <span>{entry.ip_address ?? "Brak IP"}</span>
                      <span>
                        {getDeviceLabel(entry.user_agent)}
                        <small>{entry.user_agent ?? "Brak user-agent"}</small>
                      </span>
                      <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="saas-empty-state">
                    <strong>Brak danych raportowych.</strong>
                    <p>Poczekaj na pierwsze wpisy w tej sesji.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </section>
      </main>
    );
  }

  const publicAverage = averageMinutes(sharedData.publicEntries.map((entry) => entry.screen_time_minutes));
  const publicParticipants = new Set(sharedData.publicEntries.map((entry) => entry.session_id)).size;

  return (
    <main className="saas-public-session-shell">
      <header className="saas-landing-nav">
        <Link href="/" className="saas-logo-row">
          <div className="saas-logo-mark">
            <Orbit size={20} />
          </div>
          <div>
            <strong>Wojticore Flowa</strong>
            <p>Publiczny panel wpisywania czasu</p>
          </div>
        </Link>
      </header>

      {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}

      <section className="saas-public-session-grid">
        <article className="saas-panel-card saas-panel-card-hero">
          <span className="saas-pill">Sesja publiczna</span>
          <h1>{sharedData.session.name}</h1>
          <p className="saas-lead">
            {sharedData.session.description || "Wpisz swój dzisiejszy czas przed ekranem dla tej sesji."}
          </p>
          <div className="saas-chip-row">
            <span className="saas-chip"><Users size={14} /> Limit: {sharedData.session.max_participants} osób</span>
            <span className="saas-chip"><Clock3 size={14} /> Wiek: {sharedData.session.age_group}</span>
          </div>
        </article>

        <article className="saas-panel-card">
          <div className="saas-card-head">
            <div>
              <span className="saas-section-label">Panel wpisywania czasu</span>
              <h2>Dodaj swój wynik</h2>
            </div>
            <Clock3 size={18} />
          </div>
          <form action={submitScreenTimeAction} className="saas-form-grid">
            <input type="hidden" name="trackedSessionId" value={sharedData.session.id} />
            <input type="hidden" name="redirectTo" value={`/session/${sharedData.session.id}`} />
            <div className="saas-time-grid">
              <label className="saas-field">
                <span>Godziny</span>
                <input type="number" name="hours" min={0} max={23} placeholder="00" />
              </label>
              <label className="saas-field">
                <span>Minuty</span>
                <input type="number" name="minutes" min={0} max={59} placeholder="00" />
              </label>
            </div>
            <button className="saas-button saas-button-block" type="submit">
              Zapisz czas przed ekranem
            </button>
          </form>
        </article>
      </section>

      <section className="saas-metric-grid">
        <article className="saas-metric-card">
          <span>Uczestnicy</span>
          <strong>{publicParticipants}</strong>
          <p>Unikalne przeglądarki, które wysłały wynik w tej sesji.</p>
        </article>
        <article className="saas-metric-card">
          <span>Wpisy</span>
          <strong>{sharedData.publicEntries.length}</strong>
          <p>Łączna liczba wpisów przypisanych do tej sesji.</p>
        </article>
        <article className="saas-metric-card">
          <span>Średni czas</span>
          <strong>{formatMinutes(publicAverage)}</strong>
          <p>Średnia z dotychczas zebranych odpowiedzi.</p>
        </article>
        <article className="saas-metric-card">
          <span>Twoja ostatnia odpowiedź</span>
          <strong>{formatMinutes(sharedData.latestEntry?.screen_time_minutes)}</strong>
          <p>{sharedData.latestEntry ? formatDateTime(sharedData.latestEntry.submitted_at) : "Brak wpisu w tej przeglądarce"}</p>
        </article>
      </section>

      <section className="saas-dashboard-grid">
        <article className="saas-panel-card">
          <div className="saas-card-head">
            <div>
              <span className="saas-section-label">Twoja historia</span>
              <h2>Wpisy z tej przeglądarki</h2>
            </div>
            <Users size={18} />
          </div>
          <div className="saas-list-grid">
            {sharedData.recentEntries.length ? (
              sharedData.recentEntries.map((entry) => (
                <article key={entry.id} className="saas-list-item">
                  <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                  <p>{formatDateTime(entry.submitted_at)}</p>
                </article>
              ))
            ) : (
              <div className="saas-empty-state">
                <strong>Brak wcześniejszych wpisów.</strong>
                <p>Po zapisaniu wyniku historia pojawi się tutaj.</p>
              </div>
            )}
          </div>
        </article>

        <article className="saas-panel-card">
          <div className="saas-card-head">
            <div>
              <span className="saas-section-label">Ostatnia aktywność</span>
              <h2>Najnowsze wpisy w sesji</h2>
            </div>
            <Activity size={18} />
          </div>
          <div className="saas-list-grid">
            {sharedData.publicEntries.length ? (
              sharedData.publicEntries.map((entry) => (
                <article key={entry.id} className="saas-list-item">
                  <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                  <p>
                    {entry.detected_os} · {formatDateTime(entry.submitted_at)}
                  </p>
                </article>
              ))
            ) : (
              <div className="saas-empty-state">
                <strong>Brak wpisów.</strong>
                <p>Udostępnij link dalej, aby zobaczyć pierwsze odpowiedzi.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
