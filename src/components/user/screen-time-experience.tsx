"use client";

import { useDeferredValue, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
} from "lucide-react";

import { formatDateTime, formatMinutes, formatPercentage } from "@/lib/format";
import {
  getOperatingSystemConfig,
  operatingSystemOrder,
} from "@/lib/os";
import type {
  FlashMessage,
  OperatingSystem,
  ScreenTimeEntry,
  SessionAnalytics,
} from "@/lib/types";

interface ScreenTimeExperienceProps {
  initialOperatingSystem: OperatingSystem;
  latestEntry: ScreenTimeEntry | null;
  recentEntries: ScreenTimeEntry[];
  analytics: SessionAnalytics | null;
  flash: FlashMessage | null;
  submitAction: (formData: FormData) => void;
}

export const ScreenTimeExperience = ({
  initialOperatingSystem,
  latestEntry,
  recentEntries,
  analytics,
  flash,
  submitAction,
}: ScreenTimeExperienceProps) => {
  const [selectedOperatingSystem, setSelectedOperatingSystem] =
    useState<OperatingSystem>(initialOperatingSystem);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);
  const deferredOperatingSystem = useDeferredValue(selectedOperatingSystem);
  const operatingSystem = getOperatingSystemConfig(deferredOperatingSystem);

  const defaultHours = latestEntry
    ? String(Math.floor(latestEntry.screen_time_minutes / 60)).padStart(2, "0")
    : "";
  const defaultMinutes = latestEntry
    ? String(latestEntry.screen_time_minutes % 60).padStart(2, "0")
    : "";

  const openSystemSettings = () => {
    if (!operatingSystem.settingsLink) {
      setSettingsFeedback(operatingSystem.settingsHint);
      return;
    }

    setSettingsFeedback(operatingSystem.settingsHint);
    window.location.href = operatingSystem.settingsLink;
  };

  return (
    <div className="page-stack">
      {flash ? (
        <div className={`flash-banner ${flash.type}`}>{flash.message}</div>
      ) : null}

      <section className="hero-grid">
        <article className="hero-card">
          <div className="eyebrow">
            <Sparkles size={16} />
            Aura Clarity
          </div>
          <h1>Zrozum swój dzisiejszy cyfrowy rytm.</h1>
          <p>
            Wykrywamy system, pomagamy znaleźć screen time i od razu porównujemy
            Twój wynik z orientacyjnym limitem dla wieku 12-17 lat.
          </p>
          <div className="stack-row" style={{ marginTop: 24 }}>
            <span className="metric-pill">
              <CheckCircle2 size={16} />
              Wykryto: {getOperatingSystemConfig(initialOperatingSystem).label}
            </span>
            <span className="metric-pill">
              <Layers3 size={16} />
              Sesja bez logowania
            </span>
          </div>
        </article>

        <article className="soft-card invert">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Status urządzenia</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                {operatingSystem.label}
              </h2>
            </div>
            <div className="icon-bubble">
              <CheckCircle2 />
            </div>
          </div>

          <p className="muted" style={{ marginTop: 0 }}>
            {operatingSystem.description}
          </p>

          <div className="system-chip-list" style={{ marginTop: 16 }}>
            {operatingSystemOrder.map((item) => {
              const itemConfig = getOperatingSystemConfig(item);

              return (
                <button
                  key={item}
                  type="button"
                  className="system-chip"
                  data-active={selectedOperatingSystem === item}
                  onClick={() => setSelectedOperatingSystem(item)}
                >
                  {itemConfig.label}
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="card-grid">
        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Instrukcja</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                {operatingSystem.headline}
              </h2>
            </div>
            <div className="icon-bubble">
              <ArrowUpRight />
            </div>
          </div>

          <ol className="instruction-list">
            {operatingSystem.steps.map((step, index) => (
              <li key={step}>
                <span className="instruction-step">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="actions-row" style={{ marginTop: 20 }}>
            <button type="button" className="primary-button" onClick={openSystemSettings}>
              <ArrowUpRight size={18} />
              {operatingSystem.settingsButtonLabel}
            </button>
          </div>

          <div className="hint-box" style={{ marginTop: 16 }}>
            {settingsFeedback ?? operatingSystem.settingsHint}
          </div>
        </article>

        <article className="soft-card">
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Dzisiejszy wynik</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                Wpisz czas przed ekranem
              </h2>
            </div>
            <div className="icon-bubble">
              <Clock3 />
            </div>
          </div>

          <form action={submitAction} className="screen-time-form">
            <input type="hidden" name="operatingSystem" value={selectedOperatingSystem} />

            <div className="time-grid">
              <label className="field">
                <span className="field-label">Godziny</span>
                <input
                  className="time-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={23}
                  name="hours"
                  placeholder="00"
                  defaultValue={defaultHours}
                />
              </label>
              <span className="time-separator">:</span>
              <label className="field">
                <span className="field-label">Minuty</span>
                <input
                  className="time-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  name="minutes"
                  placeholder="00"
                  defaultValue={defaultMinutes}
                />
              </label>
            </div>

            <div className="hint-box">
              Orientacyjny limit rekreacyjnego screen time dla młodzieży 12-17 lat:
              do {analytics?.recommendedMinutes ?? 120} minut dziennie.
            </div>

            <button className="primary-button" type="submit">
              <BarChart3 size={18} />
              Analizuj mój czas
            </button>
          </form>
        </article>

        <article className={`soft-card result-card ${analytics?.resultTone ?? "good"}`}>
          <div className="card-title-row">
            <div>
              <div className="eyebrow">Wynik analizy</div>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                {analytics
                  ? `Twój wynik: ${analytics.resultLabel}`
                  : "Wpisz pierwszy wynik"}
              </h2>
            </div>
            <div className="icon-bubble">
              <Sparkles />
            </div>
          </div>

          {analytics && latestEntry ? (
            <>
              <div className="big-number">{formatMinutes(latestEntry.screen_time_minutes)}</div>
              <p className="muted" style={{ marginTop: 10 }}>
                {analytics.summary}
              </p>
              <div className="progress-track" style={{ marginTop: 18 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${analytics.alignmentScore}%` }}
                />
              </div>
              <p className="muted" style={{ marginTop: 12 }}>
                {analytics.guidance}
              </p>
            </>
          ) : (
            <div className="empty-state">
              <strong>Brak analizy</strong>
              <span>
                Po wpisaniu czasu zobaczysz porównanie do innych uczestników i średnich
                dla wykrytego systemu.
              </span>
            </div>
          )}
        </article>
      </section>

      <section className="stats-grid">
        <article className="mini-stat">
          <span className="subtle-label">Średnia wszystkich</span>
          <strong>{formatMinutes(analytics?.overallAverageMinutes)}</strong>
        </article>
        <article className="mini-stat">
          <span className="subtle-label">Średnia tego systemu</span>
          <strong>{formatMinutes(analytics?.osAverageMinutes)}</strong>
        </article>
        <article className="mini-stat">
          <span className="subtle-label">Niższy wynik miało</span>
          <strong>{analytics ? `${analytics.lowerPercentage}%` : "Brak danych"}</strong>
        </article>
        <article className="mini-stat">
          <span className="subtle-label">Trend względem poprzedniego wpisu</span>
          <strong>{formatPercentage(analytics?.trendPercentage)}</strong>
        </article>
      </section>

      <section className="soft-card">
        <div className="card-title-row">
          <div>
            <div className="eyebrow">Twoja lokalna sesja</div>
            <h2 className="card-title" style={{ marginTop: 12 }}>
              Ostatnie wpisy z tej przeglądarki
            </h2>
          </div>
          <div className="icon-bubble">
            <Clock3 />
          </div>
        </div>

        {recentEntries.length ? (
          <div className="list-grid">
            {recentEntries.map((entry) => (
              <article key={entry.id} className="recent-entry">
                <strong>{formatMinutes(entry.screen_time_minutes)}</strong>
                <div className="entry-meta">
                  <span>{getOperatingSystemConfig(entry.detected_os).label}</span>
                  <span>{formatDateTime(entry.submitted_at)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Jeszcze nic tu nie ma.</strong>
            <span>
              Pierwszy zapis przypiszemy do lokalnej sesji cookie, więc kolejne wejścia w tej
              samej przeglądarce pokażą Twoją historię.
            </span>
          </div>
        )}
      </section>
    </div>
  );
};