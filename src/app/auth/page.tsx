import { Leaf, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAdminAction, registerOrganizerAction } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.error === "missing-credentials") {
    return { type: "error", message: "Podaj adres e-mail i hasło, aby się zalogować." };
  }

  if (params.error === "invalid-credentials") {
    return { type: "error", message: "Logowanie nie powiodło się. Sprawdź dane konta." };
  }

  if (params.error === "missing-registration-fields") {
    return { type: "error", message: "Uzupełnij nazwę organizacji, e-mail i oba pola hasła." };
  }

  if (params.error === "weak-password") {
    return { type: "error", message: "Hasło musi mieć co najmniej 8 znaków." };
  }

  if (params.error === "password-mismatch") {
    return { type: "error", message: "Hasła nie są identyczne." };
  }

  if (params.error === "registration-failed") {
    return { type: "error", message: "Nie udało się utworzyć konta organizatora." };
  }

  if (params.error === "not-authorized") {
    return {
      type: "error",
      message: "To konto nie ma jeszcze aktywnego członkostwa w organizacji Flowa.",
    };
  }

  if (params.registered === "1") {
    return {
      type: "info",
      message: "Konto zostało utworzone. Jeśli wymagane jest potwierdzenie e-mail, dokończ je i wróć do logowania.",
    };
  }

  return null;
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode = params.mode === "register" ? "register" : "login";
  const flash = getFlashMessage(params);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const adminClient = createSupabaseAdminClient();
    const { count } = await adminClient
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active");

    if ((count ?? 0) > 0) {
      redirect("/admin");
    }
  }

  return (
    <>
      <main className="wf-auth-shell">
        <section className="wf-auth-card">
          <div className="wf-auth-header">
            <div className="wf-brand" style={{ justifyContent: "center", display: "flex" }}>
              <div className="wf-brand-mark">
                <Leaf size={18} />
              </div>
              <span>Wojticore Flowa</span>
            </div>
            <div className="wf-auth-subtitle">Panel Organizatora</div>
          </div>

          <div className="wf-tab-row">
            <Link className={`wf-tab-link${mode === "login" ? " is-active" : ""}`} href="/auth?mode=login">
              Logowanie
            </Link>
            <Link className={`wf-tab-link${mode === "register" ? " is-active" : ""}`} href="/auth?mode=register">
              Rejestracja
            </Link>
          </div>

          {flash ? <div className={`wf-flash ${flash.type}`}>{flash.message}</div> : null}

          {mode === "login" ? (
            <form action={loginAdminAction} className="wf-form-stack">
              <label className="wf-field">
                <span className="wf-field-label">E-mail</span>
                <input className="wf-input" name="email" placeholder="adres@email.com" type="email" />
              </label>
              <label className="wf-field">
                <span className="wf-field-label">Hasło</span>
                <input className="wf-input" name="password" placeholder="••••••••" type="password" />
              </label>
              <button className="wf-btn wf-btn-primary wf-btn-block" type="submit">
                Zaloguj się
              </button>
            </form>
          ) : (
            <form action={registerOrganizerAction} className="wf-form-stack">
              <label className="wf-field">
                <span className="wf-field-label">Nazwa Organizacji</span>
                <input className="wf-input" name="organizationName" placeholder="Wprowadź nazwę" type="text" />
              </label>
              <label className="wf-field">
                <span className="wf-field-label">E-mail</span>
                <input className="wf-input" name="email" placeholder="adres@email.com" type="email" />
              </label>
              <label className="wf-field">
                <span className="wf-field-label">Hasło</span>
                <input className="wf-input" name="password" placeholder="••••••••" type="password" />
              </label>
              <label className="wf-field">
                <span className="wf-field-label">Potwierdź Hasło</span>
                <input className="wf-input" name="confirmPassword" placeholder="••••••••" type="password" />
              </label>
              <button className="wf-btn wf-btn-primary wf-btn-block" type="submit">
                Utwórz konto
              </button>
            </form>
          )}

          <div className="wf-auth-helper">
            <Info size={18} />
            <p>
              Bierzesz udział w sesji? Nie musisz zakładać konta. Wystarczy skorzystać z linku udostępnionego przez organizatora.
            </p>
          </div>
        </section>
      </main>

      <footer className="wf-footer">
        <div className="wf-footer-inner">
          <div className="wf-brand">
            <div className="wf-brand-mark">
              <Leaf size={16} />
            </div>
            <span>Wojticore Flowa</span>
          </div>
          <div>© 2024 Wojticore Flowa. Wszystkie prawa zastrzeżone.</div>
          <nav className="wf-footer-nav">
            <Link href="/guides">Dokumentacja Open-Source</Link>
            <Link href="/">flowa.wojticore.pl</Link>
            <Link href="/guides">Polityka Prywatności</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}