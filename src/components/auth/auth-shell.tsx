import { ArrowLeft, Orbit } from "lucide-react";
import Link from "next/link";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export const AuthShell = ({ eyebrow, title, description, footer, children }: AuthShellProps) => {
  return (
    <main className="saas-auth-layout">
      <section className="saas-auth-panel saas-auth-copy">
        <Link href="/" className="saas-back-link">
          <ArrowLeft size={16} />
          Wróć na landing page
        </Link>
        <div className="saas-logo-row">
          <div className="saas-logo-mark">
            <Orbit size={20} />
          </div>
          <div>
            <strong>Wojticore Flowa</strong>
            <p>Open-source screen time workspace</p>
          </div>
        </div>
        <span className="saas-pill">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="saas-lead">{description}</p>
        <div className="saas-auth-note-grid">
          <article>
            <strong>Prosty przepływ</strong>
            <p>Logowanie, rejestracja i reset hasła mają spójny minimalistyczny układ.</p>
          </article>
          <article>
            <strong>Sesje live</strong>
            <p>Po wejściu do dashboardu tworzysz sesje, generujesz QR i śledzisz raporty na żywo.</p>
          </article>
        </div>
      </section>

      <section className="saas-auth-panel saas-auth-form-panel">
        {children}
        <div className="saas-auth-footer">{footer}</div>
      </section>
    </main>
  );
};
