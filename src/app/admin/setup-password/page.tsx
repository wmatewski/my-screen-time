import { redirect } from "next/navigation";

import { setAdminPasswordAction } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "weak-password") {
    return { type: "error", message: "Hasło musi mieć co najmniej 8 znaków." };
  }

  if (code === "password-mismatch") {
    return { type: "error", message: "Hasła nie są identyczne." };
  }

  if (code === "update-failed") {
    return { type: "error", message: "Nie udało się ustawić hasła dla zaproszonego konta." };
  }

  return null;
};

export default async function AdminSetupPasswordPage({
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
    redirect("/auth?error=session-expired");
  }

  const flash = getFlashMessage(params.error ? String(params.error) : undefined);

  return (
    <main className="wf-auth-shell">
      <section className="wf-auth-card">
        <div className="wf-badge">Dokończ konfigurację</div>
        <h1 style={{ marginTop: 20 }}>Ustaw hasło dla zaproszonego konta.</h1>
        <p className="wf-auth-subtitle" style={{ fontSize: 16, lineHeight: 1.7 }}>
          Zalogowaliśmy Cię przez link z wiadomości e-mail. Ustaw własne hasło, aby aktywować dostęp do panelu organizacji.
        </p>

        {flash ? <div className={`wf-flash ${flash.type}`}>{flash.message}</div> : null}

        <form action={setAdminPasswordAction} className="wf-form-stack" style={{ marginTop: 24 }}>
          <label className="wf-field">
            <span className="wf-field-label">Nowe hasło</span>
            <input className="wf-input" name="password" type="password" />
          </label>

          <label className="wf-field">
            <span className="wf-field-label">Powtórz hasło</span>
            <input className="wf-input" name="confirmPassword" type="password" />
          </label>

          <button className="wf-btn wf-btn-primary wf-btn-block" type="submit">
            Zapisz hasło i przejdź do panelu
          </button>
        </form>
      </section>
    </main>
  );
}