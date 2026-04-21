import { ArrowRight, CheckCircle2, Orbit, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "Tworzysz sesję w dashboardzie",
    description: "Nadajesz nazwę, kategorię wiekową, limit uczestników i opcjonalny opis.",
  },
  {
    title: "Udostępniasz QR i krótki link",
    description: "Każda sesja ma długi link `/session/{uuid}` oraz skrót oparty o pierwsze 7 znaków UUID.",
  },
  {
    title: "Śledzisz wyniki na żywo",
    description: "Panel sesji pokazuje overview, live aktywność i raport z dokładnymi metadanymi.",
  },
];

const features = [
  "Minimalistyczny nowoczesny layout SaaS",
  "Open source i Supabase Realtime",
  "Dashboard z pełnowysokościowym sidebar",
  "QR, krótki link i raport sesji",
];

export default function HomePage() {
  return (
    <main className="saas-landing-shell">
      <header className="saas-landing-nav">
        <Link href="/" className="saas-logo-row">
          <div className="saas-logo-mark">
            <Orbit size={20} />
          </div>
          <div>
            <strong>Wojticore Flowa</strong>
            <p>Open-source session workspace</p>
          </div>
        </Link>

        <div className="saas-nav-actions">
          <Link href="/login" className="saas-link-button">
            Logowanie
          </Link>
          <Link href="/sign-up" className="saas-button saas-button-small">
            Zacznij teraz
          </Link>
        </div>
      </header>

      <section className="saas-hero">
        <div>
          <span className="saas-pill">
            <Sparkles size={14} />
            Nowy minimalistyczny landing page
          </span>
          <h1>Twórz sesje screen time i prowadź je jak nowoczesny SaaS.</h1>
          <p className="saas-lead">
            Wojticore Flowa zbiera wpisy uczestników, generuje krótkie linki i QR oraz pokazuje live statystyki w jednym panelu sesji.
          </p>
          <div className="saas-hero-actions">
            <Link href="/sign-up" className="saas-button">
              Utwórz konto
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="saas-button saas-button-secondary">
              Mam już konto
            </Link>
          </div>
          <div className="saas-chip-row">
            {features.map((feature) => (
              <span key={feature} className="saas-chip">
                <CheckCircle2 size={14} />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="saas-hero-card-grid">
          <article className="saas-stat-card saas-stat-card-spotlight">
            <span>Jak to działa</span>
            <strong>Sesja → Link → QR → Live raport</strong>
            <p>Cały przepływ jest zaprojektowany pod szybkie uruchomienie badania lub ankiety screen time.</p>
          </article>
          <article className="saas-stat-card">
            <QrCode size={18} />
            <strong>Jedno kliknięcie do udostępnienia</strong>
            <p>Po utworzeniu sesji od razu przechodzisz do panelu z QR i linkami.</p>
          </article>
          <article className="saas-stat-card">
            <ShieldCheck size={18} />
            <strong>Raport z kontrolą wejścia</strong>
            <p>Przed wejściem do raportu pojawia się modal ostrzegający przed prezentowaniem ekranu.</p>
          </article>
        </div>
      </section>

      <section className="saas-section-grid">
        <article className="saas-section-card">
          <span className="saas-section-label">Przepływ produktu</span>
          <h2>Od landing page do raportu sesji.</h2>
          <div className="saas-step-list">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="saas-section-card">
          <span className="saas-section-label">Co dostajesz</span>
          <h2>Dashboard, panel wpisywania czasu i sesję z live overview.</h2>
          <div className="saas-feature-stack">
            <div>
              <strong>Landing page bez formularzy</strong>
              <p>Tylko jasne „jak to działa”, CTA i nowoczesna prezentacja produktu.</p>
            </div>
            <div>
              <strong>Auth pages w jednym stylu</strong>
              <p>/login, /sign-up i /password-reset korzystają z tego samego lekkiego systemu UI.</p>
            </div>
            <div>
              <strong>Panel sesji na pełnym ekranie</strong>
              <p>Sidebar sesji zmienia się względem zwykłego dashboardu i prowadzi do zakładek Przegląd oraz Raport.</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
