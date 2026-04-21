import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginUserAction } from "@/app/account/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "missing-credentials") {
    return { type: "error", message: "Podaj adres e-mail i hasło." };
  }

  if (code === "invalid-credentials") {
    return { type: "error", message: "Logowanie nie powiodło się. Sprawdź dane konta." };
  }

  if (code === "missing-profile") {
    return {
      type: "error",
      message: "Konto nie ma jeszcze przypisanej organizacji lub profilu aplikacji.",
    };
  }

  if (code === "session-expired") {
    return { type: "error", message: "Sesja wygasła. Zaloguj się ponownie." };
  }

  return null;
};

export default async function AccountLoginPage({
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
            <ShieldCheck size={22} />
          </div>
          <div className="brand-copy">
            <strong>Aura Clarity</strong>
            <span>Logowanie użytkownika</span>
          </div>
        </div>

        <h1 style={{ marginTop: 24 }}>Zaloguj się, aby tworzyć własne sesje i śledzić dane live.</h1>
        <p className="muted" style={{ marginTop: 14, lineHeight: 1.65 }}>
          Po zalogowaniu zobaczysz prywatny panel, linki do sesji i członków swojej organizacji.
        </p>

        {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

        <form action={loginUserAction} className="auth-form">
          <label className="field">
            <span className="field-label">E-mail</span>
            <input className="auth-input" type="email" name="email" required />
          </label>
          <label className="field">
            <span className="field-label">Hasło</span>
            <input className="auth-input" type="password" name="password" required />
          </label>

          <button className="primary-button" type="submit">
            Zaloguj do panelu
          </button>
        </form>

        <div className="auth-footer">
          Nie masz konta? <Link href="/account/register">Załóż je tutaj</Link>
        </div>
      </section>
    </main>
  );
}
