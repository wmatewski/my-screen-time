import { MailPlus, ShieldCheck, Smartphone, Users } from "lucide-react";

import { inviteAdminAction } from "@/app/admin/actions";
import { getAdminDashboardData } from "@/lib/data";
import {
  formatDateTime,
  formatMinutes,
  formatRole,
  formatStatus,
} from "@/lib/format";
import { getOperatingSystemConfig } from "@/lib/os";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.invite === "sent") {
    return {
      type: "success",
      message: "Zaproszenie administratora zostało wysłane przez Supabase Auth.",
    };
  }

  if (params.password === "updated") {
    return {
      type: "success",
      message: "Hasło ustawione poprawnie. Konto administratora jest już aktywne.",
    };
  }

  if (params.error === "missing-email") {
    return { type: "error", message: "Podaj adres e-mail nowego administratora." };
  }

  if (params.error === "invite-failed") {
    return {
      type: "error",
      message: "Nie udało się wysłać zaproszenia. Konto może już istnieć albo konfiguracja maili w Supabase jest niegotowa.",
    };
  }

  return null;
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flash = getFlashMessage(params);
  const data = await getAdminDashboardData();

  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">Statystyki screentime</div>
          <h1 className="big-title" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: 14 }}>
            Lekki panel do monitorowania wpisów i administratorów.
          </h1>
          <p className="admin-layout-note" style={{ marginTop: 14 }}>
            Wszystkie dane aplikacyjne pochodzą z własnego schematu <strong>screentime</strong>.
          </p>
        </div>

        <div className="soft-card" style={{ padding: 18, minWidth: 260 }}>
          <div className="subtle-label">Aktywne sesje uczestników</div>
          <strong className="big-number">{data.totalParticipants}</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Oparte o najnowszy wpis z każdej lokalnej sesji.
          </p>
        </div>
      </header>

      {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

      <section className="dashboard-grid">
        <article className="metric-card">
          <span className="subtle-label">Uczestnicy</span>
          <strong className="metric-value">{data.totalParticipants}</strong>
          <p className="muted">Unikalne sesje z najnowszym wynikiem.</p>
        </article>
        <article className="metric-card">
          <span className="subtle-label">Wszystkie wpisy</span>
          <strong className="metric-value">{data.totalSubmissions}</strong>
          <p className="muted">Łączna liczba zapisanych rekordów.</p>
        </article>
        <article className="metric-card">
          <span className="subtle-label">Dzisiejsze wpisy</span>
          <strong className="metric-value">{data.todaySubmissions}</strong>
          <p className="muted">Nowe rekordy dodane dzisiaj.</p>
        </article>
        <article className="metric-card">
          <span className="subtle-label">Średnia wszystkich</span>
          <strong className="metric-value">{formatMinutes(data.overallAverageMinutes)}</strong>
          <p className="muted">Średni czas na podstawie najnowszych sesji.</p>
        </article>
      </section>

      <section className="admin-grid">
        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Statystyki systemów</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Średnie i rozkład systemów
              </h2>
            </div>
            <div className="icon-bubble">
              <Smartphone />
            </div>
          </div>

          {data.osStatistics.length ? (
            <div className="list-grid">
              {data.osStatistics.map((item) => (
                <article key={item.detected_os} className="data-list">
                  <div className="stack-row" style={{ justifyContent: "space-between" }}>
                    <strong>{getOperatingSystemConfig(item.detected_os).label}</strong>
                    <span className="tag">{item.participants} sesji</span>
                  </div>
                  <div className="entry-meta">
                    <span>Średnia: {formatMinutes(item.average_minutes)}</span>
                    <span>Min: {formatMinutes(item.minimum_minutes)}</span>
                    <span>Max: {formatMinutes(item.maximum_minutes)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Brak danych o systemach.</strong>
              <span>Pierwsze wpisy użytkowników pojawią się tutaj automatycznie.</span>
            </div>
          )}
        </article>

        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Dodaj admina</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Wyślij zaproszenie e-mail
              </h2>
            </div>
            <div className="icon-bubble">
              <MailPlus />
            </div>
          </div>

          <form action={inviteAdminAction} className="auth-form">
            <label className="field">
              <span className="field-label">Adres e-mail</span>
              <input className="auth-input" type="email" name="email" required />
            </label>

            <button className="primary-button" type="submit">
              Wyślij zaproszenie przez Supabase Auth
            </button>
          </form>

          <p className="admin-layout-note" style={{ marginTop: 18 }}>
            Alternatywnie możesz utworzyć konto ręcznie w Supabase Auth, a potem przypisać mu rolę
            poleceniem <strong>{"select screentime.bootstrap_admin('email');"}</strong>
          </p>
        </article>
      </section>

      <section className="admin-grid">
        <article className="table-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Adresy IP</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Skąd przychodzą wpisy
              </h2>
            </div>
            <div className="icon-bubble">
              <ShieldCheck />
            </div>
          </div>

          <div className="table-head table-grid-ip">
            <span>IP</span>
            <span>Wpisy</span>
            <span>Średnia</span>
            <span>Ostatnio widziany</span>
          </div>

          {data.ipStatistics.map((item) => (
            <div key={`${item.ip_address}-${item.last_seen}`} className="table-row table-grid-ip">
              <strong>{item.ip_address}</strong>
              <span>{item.submissions}</span>
              <span>{formatMinutes(item.average_minutes)}</span>
              <span>{formatDateTime(item.last_seen)}</span>
            </div>
          ))}
        </article>

        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Administratorzy</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Lista uprawnionych kont
              </h2>
            </div>
            <div className="icon-bubble">
              <Users />
            </div>
          </div>

          {data.adminProfiles.length ? (
            <div className="panel-grid">
              {data.adminProfiles.map((profile) => (
                <article key={profile.user_id} className="admin-list-item">
                  <strong>{profile.email}</strong>
                  <div className="entry-meta">
                    <span>{formatRole(profile.role)}</span>
                    <span>{formatStatus(profile.status)}</span>
                    <span>Dodano: {formatDateTime(profile.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Brak administratorów.</strong>
              <span>Dodaj pierwsze konto ręcznie w Supabase, a potem przypisz je do panelu.</span>
            </div>
          )}
        </article>
      </section>

      <section className="table-card">
        <div className="card-title-row">
          <div>
            <div className="eyebrow">Ostatnie wpisy</div>
            <h2 className="card-title" style={{ marginTop: 12 }}>
              Surowe rekordy zapisane w bazie
            </h2>
          </div>
          <div className="icon-bubble">
            <Smartphone />
          </div>
        </div>

        <div className="table-head table-grid-entries">
          <span>System i czas</span>
          <span>IP</span>
          <span>Sesja</span>
          <span>Data</span>
        </div>

        {data.recentEntries.map((entry) => (
          <div key={entry.id} className="table-row table-grid-entries">
            <div>
              <strong>{getOperatingSystemConfig(entry.detected_os).label}</strong>
              <div className="table-meta">{formatMinutes(entry.screen_time_minutes)}</div>
            </div>
            <span>{entry.ip_address ?? "unknown"}</span>
            <span>{entry.session_id.slice(0, 8)}...</span>
            <span>{formatDateTime(entry.submitted_at)}</span>
          </div>
        ))}
      </section>
    </>
  );
}