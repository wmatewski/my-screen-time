"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, FileBarChart2, LayoutPanelTop, X } from "lucide-react";

interface SessionTabNavProps {
  sessionId: string;
  activeTab: "overview" | "report";
}

export const SessionTabNav = ({ sessionId, activeTab }: SessionTabNavProps) => {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="saas-session-tabs">
        <button
          type="button"
          className={`saas-tab-button ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => router.push(`/session/${sessionId}`)}
        >
          <LayoutPanelTop size={16} />
          Przegląd
        </button>
        <button
          type="button"
          className={`saas-tab-button ${activeTab === "report" ? "is-active" : ""}`}
          onClick={() => {
            if (activeTab === "report") {
              return;
            }

            setConfirmOpen(true);
          }}
        >
          <FileBarChart2 size={16} />
          Raport
        </button>
      </div>

      {confirmOpen ? (
        <div className="saas-modal-backdrop" role="presentation">
          <div className="saas-modal-card saas-modal-small" role="dialog" aria-modal="true">
            <div className="saas-modal-header">
              <div>
                <span className="saas-pill">Ostrzeżenie</span>
                <h2>Upewnij się, że nie prezentujesz ekranu</h2>
              </div>
              <button
                type="button"
                className="saas-icon-button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Zamknij modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="saas-lead saas-lead-compact">
              Raport pokazuje dokładne godziny, adresy IP i urządzenia uczestników tej sesji.
            </p>

            <div className="saas-warning-box">
              <AlertTriangle size={18} />
              <span>Przejdź dalej dopiero, jeśli ten ekran nie jest widoczny dla uczestników.</span>
            </div>

            <div className="saas-form-actions">
              <button type="button" className="saas-button saas-button-secondary" onClick={() => setConfirmOpen(false)}>
                Wróć
              </button>
              <button
                type="button"
                className="saas-button"
                onClick={() => {
                  setConfirmOpen(false);
                  router.push(`/session/${sessionId}?tab=report`);
                }}
              >
                Rozumiem, przejdź do raportu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
