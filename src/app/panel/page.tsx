import { Clock3, Link2, QrCode, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  createTrackedSessionAction,
  inviteOrganizationMemberAction,
} from "@/app/account/actions";
import { LiveRefresh } from "@/components/user/live-refresh";
import { getAuthenticatedAppUser } from "@/lib/app-auth";
import { getUserDashboardData } from "@/lib/data";
import { formatDateTime, formatMinutes, formatRole, formatStatus } from "@/lib/format";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.registered === "1") {
    return { type: "success", message: "Konto zostało utworzone. Możesz dodać pierwszą sesję." };
  }

  if (params.session === "created") {
    return { type: "success", message: "Nowa sesja została utworzona i ma już własny link." };
  }

  if (params.invite === "sent") {
    return { type: "success", message: "Zaproszenie do organizacji zostało wysłane e-mailem." };
  }

  if (params.password === "updated") {
    return { type: "success", message: "Hasło ustawione. Konto jest aktywne." };
  }

  if (params.error === "missing-session-name") {
    return { type: "error", message: "Podaj nazwę nowej sesji." };
  }

  if (params.error === "session-create-failed") {
    return { type: "error", message: "Nie udało się utworzyć sesji." };
  }

  if (params.error === "missing-member-fields") {
    return { type: "error", message: "Podaj imię i e-mail osoby zapraszanej." };
  }

  if (params.error === "member-invite-failed") {
    return {
      type: "error",
      message: "Nie udało się dodać użytkownika do organizacji. Sprawdź konfigurację maili w Supabase.",
    };
  }

  if (params.error === "owner-only") {
    return { type: "error", message: "Tylko właściciel organizacji może zapraszać użytkowników." };
  }

  return null;
};

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const auth = await getAuthenticatedAppUser();
  const data = await getUserDashboardData({
    userId: auth.user.id,
    organizationId: auth.organization.id,
    profile: auth.profile,
    membership: auth.membership,
    organization: auth.organization,
  });
  const flash = getFlashMessage(params);
  const sessionNames = new Map(data.trackedSessions.map((session) => [session.id, session.name]));

  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">Panel użytkownika</div>
          <h1 className="big-title" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: 14 }}>
            Twoje sesje screen time i live dane organizacji.
          </h1>
          <p className="admin-layout-note" style={{ marginTop: 14 }}>
            Tworzysz własne linki do zbierania danych, a organizacja {data.organization.name} ma wspólną listę członków.
          </p>
          <div style={{ marginTop: 18 }}>
            <LiveRefresh />
          </div>
        </div>

        <div className="soft-card" style={{ padding: 18, minWidth: 260 }}>
          <div className="subtle-label">Twoje aktywne sesje</div>
          <strong className="big-number">{data.trackedSessions.length}</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Każda sesja ma własny link publiczny i kod QR.
          </p>
        </div>
      </header>

      {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

      <section className="admin-grid">
        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Nowa sesja</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Utwórz panel do zbierania czasu przed ekranem
              </h2>
            </div>
            <div className="icon-bubble">
              <Clock3 />
            </div>
          </div>

          <form action={createTrackedSessionAction} className="auth-form">
            <label className="field">
              <span className="field-label">Nazwa sesji</span>
              <input className="auth-input" type="text" name="name" required minLength={2} />
            </label>
            <label className="field">
              <span className="field-label">Opis (opcjonalnie)</span>
              <input className="auth-input" type="text" name="description" />
            </label>

            <button className="primary-button" type="submit">
              Utwórz sesję
            </button>
          </form>
        </article>

        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Organizacja</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Dodaj użytkownika do swojej organizacji
              </h2>
            </div>
            <div className="icon-bubble">
              <Users />
            </div>
          </div>

          <form action={inviteOrganizationMemberAction} className="auth-form">
            <label className="field">
              <span className="field-label">Imię i nazwisko</span>
              <input className="auth-input" type="text" name="fullName" required minLength={2} />
            </label>
            <label className="field">
              <span className="field-label">E-mail</span>
              <input className="auth-input" type="email" name="email" required />
            </label>

            <button className="primary-button" type="submit" disabled={data.membership.role !== "owner"}>
              Wyślij zaproszenie
            </button>
          </form>
        </article>
      </section>

      <section className="table-card">
        <div className="card-title-row">
          <div>
            <div className="eyebrow">Moje sesje</div>
            <h2 className="card-title" style={{ marginTop: 12 }}>
              Link publiczny, QR i statystyki na żywo
            </h2>
          </div>
          <div className="icon-bubble">
            <QrCode />
          </div>
        </div>

        {data.trackedSessions.length ? (
          <div className="session-grid">
            {data.trackedSessions.map((session) => (
              <article key={session.id} className="session-card">
                <div className="card-title-row" style={{ marginBottom: 16 }}>
                  <div>
                    <strong>{session.name}</strong>
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                      {session.description || "Publiczny panel do wpisywania czasu przed ekranem."}
                    </p>
                  </div>
                  <span className="tag">{session.submissions} wpisów</span>
                </div>
                <div className="session-card-grid">
                  <div>
                    <div className="entry-meta" style={{ marginBottom: 12 }}>
                      <span>Średnia: {formatMinutes(session.average_minutes)}</span>
                      <span>
                        Ostatni wpis:{" "}
                        {session.last_submission_at ? formatDateTime(session.last_submission_at) : "Brak danych"}
                      </span>
                    </div>
                    <a className="inline-link" href={session.share_url} target="_blank" rel="noreferrer">
                      <Link2 size={16} />
                      {session.share_url}
                    </a>
                    <div style={{ marginTop: 16 }}>
                      <Link className="secondary-link" href={`/session/${session.slug}`}>
                        Otwórz panel sesji
                      </Link>
                    </div>
                  </div>
                  <div className="qr-card">
                    <Image src={session.qr_code_data_url} alt={`Kod QR dla sesji ${session.name}`} width={220} height={220} unoptimized />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Nie masz jeszcze żadnej sesji.</strong>
            <span>Utwórz pierwszą sesję, a od razu pojawi się tutaj link i kod QR.</span>
          </div>
        )}
      </section>

      <section className="admin-grid">
        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Członkowie organizacji</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Role i statusy użytkowników
              </h2>
            </div>
            <div className="icon-bubble">
              <Users />
            </div>
          </div>

          {data.organizationMembers.length ? (
            <div className="panel-grid">
              {data.organizationMembers.map((member) => (
                <article key={member.id} className="admin-list-item">
                  <strong>{member.profile?.full_name ?? member.profile?.email ?? member.user_id}</strong>
                  <div className="entry-meta">
                    <span>{member.profile?.email ?? "Brak e-maila"}</span>
                    <span>{formatRole(member.role)}</span>
                    <span>{formatStatus(member.status)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Brak użytkowników.</strong>
              <span>Zaproś pierwszą osobę do wspólnej organizacji.</span>
            </div>
          )}
        </article>

        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Ostatnie wpisy</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Live feed z Twoich sesji
              </h2>
            </div>
            <div className="icon-bubble">
              <Clock3 />
            </div>
          </div>

          {data.recentEntries.length ? (
            <div className="list-grid">
              {data.recentEntries.map((entry) => (
                <article key={entry.id} className="recent-entry">
                  <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                  <div className="entry-meta">
                    <span>{sessionNames.get(entry.tracked_session_id ?? "") ?? "Sesja publiczna"}</span>
                    <span>{formatDateTime(entry.submitted_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Brak wpisów dla Twoich sesji.</strong>
              <span>Po udostępnieniu linku i QR tutaj zobaczysz najnowsze zgłoszenia.</span>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
