"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface SessionCreateModalProps {
  action: (formData: FormData) => void;
}

const ageGroups = ["7-12", "13-17", "18-24", "25+"];

export const SessionCreateModal = ({ action }: SessionCreateModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="saas-button" type="button" onClick={() => setOpen(true)}>
        <Plus size={18} />
        Utwórz nową
      </button>

      {open ? (
        <div className="saas-modal-backdrop" role="presentation">
          <div className="saas-modal-card" role="dialog" aria-modal="true" aria-labelledby="create-session-title">
            <div className="saas-modal-header">
              <div>
                <span className="saas-pill">Nowa sesja</span>
                <h2 id="create-session-title">Utwórz sesję badawczą</h2>
              </div>
              <button
                type="button"
                className="saas-icon-button"
                onClick={() => setOpen(false)}
                aria-label="Zamknij modal"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="saas-form-grid">
              <label className="saas-field">
                <span>Nazwa sesji</span>
                <input name="name" required minLength={2} placeholder="Np. Badanie klasy 2B" />
              </label>

              <label className="saas-field">
                <span>Kategoria wiekowa</span>
                <select name="ageGroup" defaultValue="13-17">
                  {ageGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="saas-field">
                <span>Opis (opcjonalnie)</span>
                <textarea name="description" rows={4} placeholder="Krótki opis celu sesji" />
              </label>

              <label className="saas-field">
                <span>Maksymalna liczba uczestników</span>
                <input name="maxParticipants" type="number" min={1} defaultValue={30} required />
              </label>

              <div className="saas-form-actions">
                <button type="button" className="saas-button saas-button-secondary" onClick={() => setOpen(false)}>
                  Anuluj
                </button>
                <button className="saas-button" type="submit">
                  Zapisz sesję
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};
