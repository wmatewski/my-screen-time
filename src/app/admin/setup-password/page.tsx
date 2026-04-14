import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { setAdminPasswordAction } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "weak-password") {
    return { type: "error", message: "Hasło powinno mieć co najmniej 8 znaków." };
  }

  if (code === "password-mismatch") {
    return { type: "error", message: "Hasła muszą być identyczne." };
  }

  if (code === "update-failed") {
    return {
      type: "error",
      message: "Nie udało się ustawić hasła. Otwórz link z zaproszenia ponownie.",
    };
  }

  return null;
};

export default async function SetupPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?error=session-expired");
  }

  const flash = getFlashMessage(params.error ? String(params.error) : undefined);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div className="brand-copy">
            <strong>Aura Clarity</strong>
            <span>Aktywacja konta administratora</span>
          </div>
        </div>

        <h1 style={{ marginTop: 24 }}>Ustaw hasło do zaproszonego konta.</h1>
        <p className="muted" style={{ marginTop: 14, lineHeight: 1.65 }}>
          Po zapisaniu hasła konto zostanie oznaczone jako aktywne i od razu przeniesiemy Cię do
          panelu statystyk.
        </p>

        {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

        <form action={setAdminPasswordAction} className="auth-form">
          <label className="field">
            <span className="field-label">Nowe hasło</span>
            <input className="auth-input" type="password" name="password" required />
          </label>
          <label className="field">
            <span className="field-label">Powtórz hasło</span>
            <input className="auth-input" type="password" name="confirmPassword" required />
          </label>

          <button className="primary-button" type="submit">
            Ustaw hasło i przejdź do panelu
          </button>
        </form>
      </section>
    </main>
  );
}