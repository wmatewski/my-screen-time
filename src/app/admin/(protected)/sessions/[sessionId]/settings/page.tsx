import Link from "next/link";

import { saveSessionSettingsAction } from "@/app/admin/actions";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getSessionSettingsData } from "@/lib/data";
import { formatMinutes, formatNumber } from "@/lib/format";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.saved === "1") {
    return { type: "success", message: "Ustawienia sesji zostały zapisane." };
  }

  if (params.created === "1") {
    return { type: "success", message: "Sesja została utworzona. Możesz dopracować jej parametry." };
  }

  if (params.error === "missing-name") {
    return { type: "error", message: "Nazwa sesji jest wymagana." };
  }

  return null;
};

export default async function SessionSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;
  const flash = getFlashMessage(query);
  const { organization } = await getAuthenticatedAdmin();
  const data = await getSessionSettingsData(organization.id, sessionId);

  return (
    <div className="wf-page">
      <div className="wf-page-header">
        <div>
          <div className="wf-badge">Ustawienia sesji</div>
          <h1 className="wf-page-title" style={{ marginTop: 16 }}>{data.session.name}</h1>
          <p className="wf-page-subtitle">Edytuj konfigurację sesji i zachowaj istniejących współtwórców.</p>
        </div>

        <Link className="wf-btn wf-btn-secondary" href={`/admin/sessions/${sessionId}`}>
          Wróć do statystyk
        </Link>
      </div>

      {flash ? <div className={`wf-flash ${flash.type}`}>{flash.message}</div> : null}

      <div className="wf-stats-grid">
        <form action={saveSessionSettingsAction} className="wf-panel-card wf-form-stack">
          <input name="sessionId" type="hidden" value={sessionId} />
          {data.sessionCollaboratorIds.map((membershipId) => (
            <input key={membershipId} name="collaboratorMembershipIds" type="hidden" value={membershipId} />
          ))}

          <label className="wf-field">
            <span className="wf-field-label">Nazwa sesji</span>
            <input className="wf-input" defaultValue={data.session.name} name="name" type="text" />
          </label>

          <label className="wf-field">
            <span className="wf-field-label">Opis</span>
            <textarea className="wf-textarea" defaultValue={data.session.description ?? ""} name="description" />
          </label>

          <label className="wf-field">
            <span className="wf-field-label">Limit czasu przed ekranem (minuty)</span>
            <input className="wf-input" defaultValue={String(data.session.screen_time_limit_minutes)} min="1" name="limitMinutes" type="number" />
          </label>

          <div className="wf-field">
            <span className="wf-field-label">Tryb wieku</span>
            <label className="wf-inline-meta" style={{ color: "var(--text)" }}>
              <input defaultChecked={data.session.age_mode === "variable"} name="ageMode" type="radio" value="variable" />
              Wiek podaje uczestnik
            </label>
            <label className="wf-inline-meta" style={{ color: "var(--text)" }}>
              <input defaultChecked={data.session.age_mode === "fixed"} name="ageMode" type="radio" value="fixed" />
              Stały wiek dla całej sesji
            </label>
          </div>

          <label className="wf-field">
            <span className="wf-field-label">Stały wiek</span>
            <input className="wf-input" defaultValue={String(data.session.fixed_age ?? 18)} min="1" name="fixedAge" type="number" />
          </label>

          <div className="wf-card-actions">
            <button className="wf-btn wf-btn-primary" type="submit">
              Zapisz zmiany
            </button>
            <Link className="wf-btn wf-btn-secondary" href="/admin/sessions">
              Wróć do sesji
            </Link>
          </div>
        </form>

        <aside className="wf-panel-grid" style={{ gridTemplateColumns: "1fr" }}>
          <article className="wf-panel-card">
            <h3>Podgląd sesji</h3>
            <div className="wf-member-list">
              <div className="wf-member-row">
                <span>Publiczny link</span>
                <strong>/flow/{data.session.slug}</strong>
              </div>
              <div className="wf-member-row">
                <span>Uczestnicy</span>
                <strong>{formatNumber(data.overview?.participant_count)}</strong>
              </div>
              <div className="wf-member-row">
                <span>Średni czas</span>
                <strong>{formatMinutes(data.overview?.average_minutes)}</strong>
              </div>
              <div className="wf-member-row">
                <span>Współtwórcy</span>
                <strong>{data.sessionCollaboratorIds.length}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}