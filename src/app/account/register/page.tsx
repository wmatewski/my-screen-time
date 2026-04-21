import { UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { registerUserAction } from "@/app/account/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "missing-fields") {
    return { type: "error", message: "Uzupełnij wszystkie pola formularza." };
  }

  if (code === "weak-password") {
    return { type: "error", message: "Hasło powinno mieć co najmniej 8 znaków." };
  }

  if (code === "password-mismatch") {
    return { type: "error", message: "Hasła muszą być identyczne." };
  }

  if (code === "registration-failed") {
    return {
      type: "error",
      message: "Nie udało się utworzyć konta. Sprawdź, czy e-mail nie jest już zajęty.",
    };
  }

  return null;
};

export default async function AccountRegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/panel");
  }

  const flash = getFlashMessage(params.error ? String(params.error) : undefined);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-mark">
            <UserRoundPlus size={22} />
          </div>
          <div className="brand-copy">
            <strong>Aura Clarity</strong>
            <span>Rejestracja organizacji</span>
          </div>
        </div>

        <h1 style={{ marginTop: 24 }}>Załóż konto i od razu utwórz własną organizację.</h1>
        <p className="muted" style={{ marginTop: 14, lineHeight: 1.65 }}>
          Po rejestracji otrzymasz panel do tworzenia sesji, generowania linków i zapraszania członków.
        </p>

        {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

        <form action={registerUserAction} className="auth-form">
          <label className="field">
            <span className="field-label">Imię i nazwisko</span>
            <input className="auth-input" type="text" name="fullName" required minLength={2} />
          </label>
          <label className="field">
            <span className="field-label">Nazwa organizacji</span>
            <input className="auth-input" type="text" name="organizationName" required minLength={2} />
          </label>
          <label className="field">
            <span className="field-label">E-mail</span>
            <input className="auth-input" type="email" name="email" required />
          </label>
          <label className="field">
            <span className="field-label">Hasło</span>
            <input className="auth-input" type="password" name="password" required minLength={8} />
          </label>
          <label className="field">
            <span className="field-label">Powtórz hasło</span>
            <input className="auth-input" type="password" name="confirmPassword" required minLength={8} />
          </label>

          <button className="primary-button" type="submit">
            Załóż konto
          </button>
        </form>

        <div className="auth-footer">
          Masz już konto? <Link href="/account/login">Zaloguj się</Link>
        </div>
      </section>
    </main>
  );
}
