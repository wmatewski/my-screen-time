import { Activity, ArrowUpRight, Clock3, Link2, MailPlus, QrCode, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createTrackedSessionAction,
  inviteOrganizationMemberAction,
  logoutUserAction,
} from "@/app/account/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SessionCreateModal } from "@/components/dashboard/session-create-modal";
import { getAuthenticatedAppUser } from "@/lib/app-auth";
import { formatDateTime, formatMinutes, formatRole, formatStatus } from "@/lib/format";
import { getUserDashboardData } from "@/lib/data";
import type { FlashMessage } from "@/lib/types";

const pages = new Set(["home", "sessions"]);
const formatCountLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.registered === "1") {
    return { type: "success", message: "Konto zostało utworzone. Możesz zacząć od pierwszej sesji." };
  }

  if (params.invite === "sent") {
    return { type: "success", message: "Zaproszenie do organizacji zostało wysłane." };
  }

  if (params.password === "updated") {
    return { type: "success", message: "Hasło zostało zapisane." };
  }

  if (params.error === "missing-member-fields") {
    return { type: "error", message: "Podaj imię i e-mail osoby zapraszanej." };
  }

  if (params.error === "member-invite-failed") {
    return { type: "error", message: "Nie udało się wysłać zaproszenia." };
  }

  if (params.error === "owner-only") {
    return { type: "error", message: "Tylko właściciel organizacji może wykonywać tę akcję." };
  }

  if (params.error === "missing-session-fields") {
    return { type: "error", message: "Uzupełnij nazwę, kategorię wiekową i limit uczestników." };
  }

  if (params.error === "session-create-failed") {
    return { type: "error", message: "Nie udało się utworzyć sesji." };
  }

  return null;
};

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageName: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ pageName }, query] = await Promise.all([params, searchParams]);

  if (!pages.has(pageName)) {
    notFound();
  }

  const auth = await getAuthenticatedAppUser();
  const data = await getUserDashboardData({
    userId: auth.user.id,
    organizationId: auth.organization.id,
    profile: auth.profile,
    membership: auth.membership,
    organization: auth.organization,
  });
  const flash = getFlashMessage(query);
  const totalParticipants = data.trackedSessions.reduce((sum, session) => sum + session.participants, 0);
  const totalSubmissions = data.trackedSessions.reduce((sum, session) => sum + session.submissions, 0);
  const latestSession = data.trackedSessions[0] ?? null;

  const content =
    pageName === "home" ? (
      <>
        <section className="saas-page-header">
          <div>
            <span className="saas-pill">Dashboard</span>
            <h1>Strona główna Twojego workspace.</h1>
            <p className="saas-lead">
              Zobacz ogólne statystyki organizacji, ostatnią aktywność i zapraszaj kolejne osoby do pracy na sesjach.
            </p>
          </div>
          <div className="saas-header-card">
            <span>Aktywny workspace</span>
            <strong>{data.organization.name}</strong>
            <p>
              {formatCountLabel(data.organizationMembers.length, "osoba", "osób")} i{" "}
              {formatCountLabel(data.trackedSessions.length, "sesja", "sesji")} w jednym miejscu.
            </p>
          </div>
        </section>

        <section className="saas-metric-grid">
          <article className="saas-metric-card">
            <span>Łącznie sesji</span>
            <strong>{data.trackedSessions.length}</strong>
            <p>Niezależne sesje utworzone w Twoim dashboardzie.</p>
          </article>
          <article className="saas-metric-card">
            <span>Łącznie uczestników</span>
            <strong>{totalParticipants}</strong>
            <p>Unikalne lokalne sesje przypisane do utworzonych sesji.</p>
          </article>
          <article className="saas-metric-card">
            <span>Łącznie wpisów</span>
            <strong>{totalSubmissions}</strong>
            <p>Wszystkie przesłane czasy ekranowe we wszystkich sesjach.</p>
          </article>
          <article className="saas-metric-card">
            <span>Ostatnia aktywna sesja</span>
            <strong>{latestSession?.name ?? "Brak"}</strong>
            <p>{latestSession?.last_submission_at ? formatDateTime(latestSession.last_submission_at) : "Brak nowych wpisów"}</p>
          </article>
        </section>

        <section className="saas-dashboard-grid">
          <article className="saas-panel-card">
            <div className="saas-card-head">
              <div>
                <span className="saas-section-label">Zespół</span>
                <h2>Zaproś użytkownika do organizacji</h2>
              </div>
              <MailPlus size={18} />
            </div>

            <form action={inviteOrganizationMemberAction} className="saas-form-grid">
              <label className="saas-field">
                <span>Imię i nazwisko</span>
                <input type="text" name="fullName" required minLength={2} placeholder="Nowy członek" />
              </label>
              <label className="saas-field">
                <span>E-mail</span>
                <input type="email" name="email" required placeholder="osoba@firma.pl" />
              </label>
              <button className="saas-button" type="submit" disabled={data.membership.role !== "owner"}>
                <MailPlus size={18} />
                Wyślij zaproszenie
              </button>
            </form>
          </article>

          <article className="saas-panel-card">
            <div className="saas-card-head">
              <div>
                <span className="saas-section-label">Członkowie</span>
                <h2>Role i statusy</h2>
              </div>
              <Users size={18} />
            </div>
            <div className="saas-list-grid">
              {data.organizationMembers.map((member) => (
                <article key={member.id} className="saas-list-item">
                  <strong>{member.profile?.full_name ?? member.profile?.email ?? member.user_id}</strong>
                  <p>
                    {member.profile?.email ?? "Brak e-maila"} · {formatRole(member.role)} · {formatStatus(member.status)}
                  </p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="saas-panel-card">
          <div className="saas-card-head">
            <div>
              <span className="saas-section-label">Aktywność</span>
              <h2>Ostatnie wpisy we wszystkich sesjach</h2>
            </div>
            <Activity size={18} />
          </div>
          <div className="saas-list-grid">
            {data.recentEntries.length ? (
              data.recentEntries.map((entry) => (
                <article key={entry.id} className="saas-activity-item">
                  <div>
                    <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                    <p>{formatDateTime(entry.submitted_at)}</p>
                  </div>
                  <span>{entry.detected_os}</span>
                </article>
              ))
            ) : (
              <div className="saas-empty-state">
                <strong>Brak wpisów.</strong>
                <p>Po udostępnieniu pierwszej sesji aktywność pojawi się tutaj automatycznie.</p>
              </div>
            )}
          </div>
        </section>
      </>
    ) : (
      <>
        <section className="saas-page-header">
          <div>
            <span className="saas-pill">Sesje</span>
            <h1>Zarządzaj sesjami i przechodź do panelu live.</h1>
            <p className="saas-lead">
              Utwórz nową sesję w modalu, a po zapisie od razu trafisz do panelu {"/session/{uuid}"} z overview i raportem.
            </p>
          </div>
          <SessionCreateModal action={createTrackedSessionAction} />
        </section>

        <section className="saas-session-grid">
          {data.trackedSessions.length ? (
            data.trackedSessions.map((session) => (
              <article key={session.id} className="saas-session-card">
                <div className="saas-card-head">
                  <div>
                    <span className="saas-section-label">{session.age_group}</span>
                    <h2>{session.name}</h2>
                  </div>
                  <span className="saas-tag">{session.participants}/{session.max_participants}</span>
                </div>
                <p className="saas-muted">{session.description || "Brak opisu tej sesji."}</p>
                <div className="saas-session-stats">
                  <div>
                    <span>Wpisy</span>
                    <strong>{session.submissions}</strong>
                  </div>
                  <div>
                    <span>Średni czas</span>
                    <strong>{formatMinutes(session.average_minutes)}</strong>
                  </div>
                  <div>
                    <span>Ostatnia aktywność</span>
                    <strong>{session.last_submission_at ? formatDateTime(session.last_submission_at) : "Brak"}</strong>
                  </div>
                </div>
                <div className="saas-link-stack">
                  <a href={session.share_url} target="_blank" rel="noreferrer" className="saas-inline-link">
                    <Link2 size={16} />
                    {session.share_url}
                  </a>
                  <a href={session.short_share_url} target="_blank" rel="noreferrer" className="saas-inline-link">
                    <ArrowUpRight size={16} />
                    {session.short_share_url}
                  </a>
                </div>
                <div className="saas-session-bottom">
                  <div className="saas-qr-card">
                    <Image src={session.qr_code_data_url} alt={`Kod QR dla sesji ${session.name}`} width={180} height={180} unoptimized />
                  </div>
                  <div className="saas-session-actions">
                    <div className="saas-session-mini-list">
                      <span><Clock3 size={14} /> Limit uczestników: {session.max_participants}</span>
                      <span><QrCode size={14} /> Krótki kod: {session.short_code}</span>
                    </div>
                    <Link className="saas-button saas-button-secondary" href={`/session/${session.id}`}>
                      Otwórz panel sesji
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="saas-empty-state">
              <strong>Nie masz jeszcze żadnej sesji.</strong>
              <p>Utwórz pierwszą sesję przyciskiem „Utwórz nową”.</p>
            </div>
          )}
        </section>
      </>
    );

  return (
    <DashboardShell
      activePage={pageName as "home" | "sessions"}
      email={data.profile.email}
      fullName={data.profile.full_name}
      role={data.membership.role}
      organizationName={data.organization.name}
      sessionsCount={data.trackedSessions.length}
      logoutAction={logoutUserAction}
    >
      {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}
      {content}
    </DashboardShell>
  );
}
