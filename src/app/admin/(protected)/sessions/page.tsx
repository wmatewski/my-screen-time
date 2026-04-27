import { Plus, Settings, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteSessionAction } from "@/app/admin/actions";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getSessionsListData } from "@/lib/data";
import { formatDate, formatMinutes, formatNumber, formatSessionStatus } from "@/lib/format";
import type { FlashMessage, SessionOverview, SessionStatus } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.deleted === "1") {
    return { type: "success", message: "Sesja została usunięta." };
  }

  if (params.error === "missing-session") {
    return { type: "error", message: "Nie wybrano sesji do usunięcia." };
  }

  return null;
};

const getStatusTone = (status: SessionStatus) => {
  if (status === "completed") {
    return "optimal";
  }

  if (status === "draft") {
    return "warning";
  }

  return "critical";
};

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status =
    params.status === "active" || params.status === "completed" || params.status === "draft"
      ? params.status
      : "all";
  const query = String(params.q ?? "").trim().toLowerCase();
  const flash = getFlashMessage(params);
  const { organization } = await getAuthenticatedAdmin();
  const sessions = await getSessionsListData(organization.id);

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = status === "all" || session.status === status;
    const matchesQuery =
      !query ||
      session.name.toLowerCase().includes(query) ||
      session.slug.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  const buildFilterHref = (value: string) => {
    const next = new URLSearchParams();

    if (query) {
      next.set("q", query);
    }

    if (value !== "all") {
      next.set("status", value);
    }

    const suffix = next.toString();
    return suffix ? `/admin/sessions?${suffix}` : "/admin/sessions";
  };

  return (
    <div className="wf-page">
      <div className="wf-page-header">
        <div>
          <div className="wf-badge">Moje sesje</div>
          <h1 className="wf-page-title" style={{ marginTop: 16 }}>Zarządzaj wszystkimi sesjami</h1>
          <p className="wf-page-subtitle">Twórz, edytuj i monitoruj sesje przypisane do organizacji {organization.name}.</p>
        </div>

        <Link className="wf-btn wf-btn-primary" href="/admin/sessions/new">
          <Plus size={18} />
          Utwórz nową sesję
        </Link>
      </div>

      {flash ? <div className={`wf-flash ${flash.type}`}>{flash.message}</div> : null}

      <form className="wf-search-row" method="get">
        <input className="wf-search-input" defaultValue={String(params.q ?? "")} name="q" placeholder="Szukaj sesji..." />
        {status !== "all" ? <input name="status" type="hidden" value={status} /> : null}
        <button className="wf-btn wf-btn-secondary" type="submit">
          Szukaj
        </button>
      </form>

      <div className="wf-filter-row" style={{ margin: "18px 0 26px" }}>
        {["all", "active", "completed", "draft"].map((candidate) => (
          <Link
            className={`wf-filter-link${status === candidate ? " is-active" : ""}`}
            href={buildFilterHref(candidate)}
            key={candidate}
          >
            {candidate === "all" ? "Wszystkie" : formatSessionStatus(candidate)}
          </Link>
        ))}
      </div>

      <div className="wf-session-grid">
        {filteredSessions.length ? (
          filteredSessions.map((session: SessionOverview) => (
            <article className="wf-session-card" key={session.session_id}>
              <div className={`wf-status-chip ${getStatusTone(session.status)}`}>{formatSessionStatus(session.status)}</div>
              <div>
                <h3>{session.name}</h3>
                <p>{formatDate(session.created_at)}</p>
              </div>
              <div className="wf-session-meta">
                <span>{formatNumber(session.participant_count)} uczestników</span>
                <span>{formatMinutes(session.average_minutes)}</span>
                <span>Limit: {formatMinutes(session.screen_time_limit_minutes)}</span>
              </div>
              <div className="wf-card-actions">
                <Link className="wf-btn wf-btn-primary" href={`/admin/sessions/${session.session_id}`}>
                  Otwórz
                </Link>
                <Link className="wf-icon-button" href={`/admin/sessions/${session.session_id}/settings`}>
                  <Settings size={18} />
                </Link>
                <form action={deleteSessionAction}>
                  <input name="sessionId" type="hidden" value={session.session_id} />
                  <button className="wf-icon-button danger" type="submit">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="wf-panel-card" style={{ gridColumn: "1 / -1" }}>
            <p className="wf-empty">Brak sesji spełniających podane kryteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}