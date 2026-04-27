import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Info, Leaf } from "lucide-react";

import { submitSessionEntryAction } from "@/app/actions";
import { SessionEntryForm } from "@/components/user/session-entry-form";
import { formatMinutes, formatPercentage } from "@/lib/format";
import { getPublicSessionExperienceData } from "@/lib/data";
import { publicEnv } from "@/lib/env/public";
import { detectOperatingSystem } from "@/lib/os";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.error === "invalid-time") {
    return { type: "error", message: "Podaj poprawny czas w formacie godziny:minuty, na przykład 1:30." };
  }

  if (params.error === "save-failed") {
    return { type: "error", message: "Nie udało się zapisać danych dla tej sesji." };
  }

  return null;
};

export default async function FlowSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const participantKey = cookieStore.get(publicEnv.sessionCookieName)?.value ?? "";
  const detectedOperatingSystem = detectOperatingSystem(headerStore.get("user-agent"));
  const data = await getPublicSessionExperienceData(slug, participantKey, detectedOperatingSystem);
  const requestedAge = query.age ? Number(query.age) : null;
  const age = data.session.age_mode === "fixed" ? data.session.fixed_age : requestedAge;

  if (!age) {
    redirect(`/flow/${slug}/age`);
  }

  const flash = getFlashMessage(query);

  return (
    <>
      <header className="wf-topbar">
        <div className="wf-topbar-inner">
          <Link className="wf-brand" href="/">
            <div className="wf-brand-mark">
              <Leaf size={16} />
            </div>
            <span>Wojticore Flowa</span>
          </Link>
          <Link className="wf-btn wf-btn-secondary" href="/auth">
            Zaloguj się
          </Link>
        </div>
      </header>

      <main className="wf-flow-shell">
        <div style={{ maxWidth: 640, margin: "0 auto 28px", textAlign: "center" }}>
          <div className="wf-badge">{data.session.name}</div>
          <h1 className="wf-page-title" style={{ marginTop: 16 }}>Twoja sesja</h1>
          <p className="wf-page-subtitle">
            {data.organization.name}. Zarejestruj dzisiejszy czas przed ekranem w ramach tej sesji.
          </p>
        </div>

        {flash ? <div className={`wf-flash ${flash.type}`} style={{ maxWidth: 520, margin: "0 auto 24px" }}>{flash.message}</div> : null}

        <SessionEntryForm
          age={age}
          initialMinutes={data.latestSubmission?.screen_time_minutes ?? null}
          initialOperatingSystem={data.detectedOperatingSystem}
          session={data.session}
          submitAction={submitSessionEntryAction}
        />

        {data.participantInsight ? (
          <section className="wf-flow-card" style={{ marginTop: 24 }}>
            <div className={`wf-status-chip ${data.participantInsight.tone}`}>
              {data.participantInsight.label}
            </div>
            <h3 style={{ marginTop: 16 }}>Twoja ostatnia odpowiedź</h3>
            <p>{data.participantInsight.description}</p>
            <div className="wf-inline-meta" style={{ marginTop: 18 }}>
              <span>Twoja wartość: {formatMinutes(data.latestSubmission?.screen_time_minutes)}</span>
              <span>Średnia sesji: {formatMinutes(data.sessionAverageMinutes)}</span>
              <span>
                Różnica: {data.participantInsight.deltaPercentage == null ? "Brak danych" : formatPercentage(data.participantInsight.deltaPercentage)}
              </span>
            </div>
          </section>
        ) : null}

        <div className="wf-flow-card" style={{ marginTop: 24 }}>
          <div className="wf-inline-meta" style={{ color: "var(--text)", fontWeight: 700, marginBottom: 10 }}>
            <Info size={18} />
            O sesji
          </div>
          <p>
            Limit tej sesji wynosi {formatMinutes(data.session.screen_time_limit_minutes)}. Dotychczasowe zgłoszenia uczestników: {data.participantCount}.
          </p>
        </div>
      </main>
    </>
  );
}