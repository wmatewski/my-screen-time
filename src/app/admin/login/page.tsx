import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAdminAction } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "missing-credentials") {
    return { type: "error", message: "Podaj adres e-mail i hasło administratora." };
  }

  if (code === "invalid-credentials") {
    return { type: "error", message: "Logowanie nie powiodło się. Sprawdź dane konta." };
  }

  if (code === "not-authorized") {
    return {
      type: "error",
      message: "To konto nie ma aktywnego wpisu administratora w schemacie screentime.",
    };
  }

  if (code === "session-expired") {
    return { type: "error", message: "Sesja wygasła. Zaloguj się ponownie." };
  }

  if (code === "callback-failed") {
    return {
      type: "error",
      message: "Nie udało się dokończyć logowania z linku zaproszeniowego.",
    };
  }

  return null;
};

export default async function AdminLoginPage({
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
    const adminClient = createSupabaseAdminClient();
    const { data } = await adminClient
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      redirect("/admin");
    }
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
            <span>Logowanie administratora</span>
          </div>
        </div>

        <h1 style={{ marginTop: 24 }}>Panel admina działa tylko dla zaproszonych kont.</h1>
        <p className="muted" style={{ marginTop: 14, lineHeight: 1.65 }}>
          Rejestracja publiczna jest wyłączona. Nowych administratorów dodajesz ręcznie w Supabase
          albo z poziomu już zalogowanego panelu.
        </p>

        {flash ? <div className={`flash-banner ${flash.type}`}>{flash.message}</div> : null}

        <form action={loginAdminAction} className="auth-form">
          <label className="field">
            <span className="field-label">E-mail administratora</span>
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
          Wróć do strony użytkownika: <Link href="/">otwórz ekran główny</Link>
        </div>
      </section>
    </main>
  );
}