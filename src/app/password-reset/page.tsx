import Link from "next/link";
import { redirect } from "next/navigation";

import { requestPasswordResetAction, setUserPasswordAction } from "@/app/account/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { getOptionalAuthenticatedAppUser } from "@/lib/app-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (params: Record<string, string | string[] | undefined>): FlashMessage | null => {
  if (params.sent === "1") {
    return { type: "success", message: "Link do resetu hasła został wysłany." };
  }

  if (params.error === "missing-email") {
    return { type: "error", message: "Podaj adres e-mail." };
  }

  if (params.error === "request-failed") {
    return { type: "error", message: "Nie udało się wysłać wiadomości resetującej." };
  }

  if (params.error === "weak-password") {
    return { type: "error", message: "Hasło powinno mieć co najmniej 8 znaków." };
  }

  if (params.error === "password-mismatch") {
    return { type: "error", message: "Hasła muszą być identyczne." };
  }

  if (params.error === "update-failed") {
    return { type: "error", message: "Nie udało się zapisać nowego hasła." };
  }

  return null;
};

export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, auth, supabase] = await Promise.all([
    searchParams,
    getOptionalAuthenticatedAppUser(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (auth?.membership.status === "active" && !user) {
    redirect("/dashboard/home");
  }

  const flash = getFlashMessage(params);
  const canSetPassword = Boolean(user || auth?.membership.status === "invited");

  return (
    <AuthShell
      eyebrow="Reset hasła"
      title={canSetPassword ? "Ustaw nowe hasło i wróć do dashboardu." : "Wyślij link do resetu hasła."}
      description={
        canSetPassword
          ? "Ta strona obsługuje zarówno aktywację zaproszonego konta, jak i zwykły reset hasła."
          : "Podaj e-mail, a wyślemy link prowadzący z powrotem do tego ekranu."
      }
      footer={
        <>
          Wróć do <Link href="/login">logowania</Link>
        </>
      }
    >
      {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}

      {canSetPassword ? (
        <form action={setUserPasswordAction} className="saas-form-grid">
          <label className="saas-field">
            <span>Nowe hasło</span>
            <input type="password" name="password" required minLength={8} placeholder="Nowe hasło" />
          </label>
          <label className="saas-field">
            <span>Powtórz hasło</span>
            <input type="password" name="confirmPassword" required minLength={8} placeholder="Powtórz hasło" />
          </label>
          <button className="saas-button saas-button-block" type="submit">
            Zapisz hasło
          </button>
        </form>
      ) : (
        <form action={requestPasswordResetAction} className="saas-form-grid">
          <label className="saas-field">
            <span>E-mail</span>
            <input type="email" name="email" required placeholder="twoj@adres.pl" />
          </label>
          <button className="saas-button saas-button-block" type="submit">
            Wyślij link resetujący
          </button>
        </form>
      )}
    </AuthShell>
  );
}
