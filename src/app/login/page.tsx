import Link from "next/link";
import { redirect } from "next/navigation";

import { loginUserAction } from "@/app/account/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { getOptionalAuthenticatedAppUser } from "@/lib/app-auth";
import type { FlashMessage } from "@/lib/types";

const getFlashMessage = (code: string | undefined): FlashMessage | null => {
  if (code === "missing-credentials") {
    return { type: "error", message: "Podaj adres e-mail i hasło." };
  }

  if (code === "invalid-credentials") {
    return { type: "error", message: "Logowanie nie powiodło się. Sprawdź dane konta." };
  }

  if (code === "missing-profile") {
    return { type: "error", message: "Konto nie ma jeszcze przypisanego profilu lub organizacji." };
  }

  if (code === "session-expired") {
    return { type: "error", message: "Sesja wygasła. Zaloguj się ponownie." };
  }

  return null;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, auth] = await Promise.all([searchParams, getOptionalAuthenticatedAppUser()]);

  if (auth?.membership.status === "invited") {
    redirect("/password-reset");
  }

  if (auth?.membership.status === "active") {
    redirect("/dashboard/home");
  }

  const flash = getFlashMessage(params.error ? String(params.error) : undefined);

  return (
    <AuthShell
      eyebrow="Logowanie"
      title="Zaloguj się do dashboardu i wróć do swoich sesji."
      description="Po wejściu zobaczysz statystyki, listę sesji i przełączysz się do panelu sesji z live danymi."
      footer={
        <>
          Nie masz konta? <Link href="/sign-up">Załóż je tutaj</Link>
        </>
      }
    >
      {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}
      <form action={loginUserAction} className="saas-form-grid">
        <label className="saas-field">
          <span>E-mail</span>
          <input type="email" name="email" required placeholder="twoj@adres.pl" />
        </label>
        <label className="saas-field">
          <span>Hasło</span>
          <input type="password" name="password" required placeholder="••••••••" />
        </label>
        <button className="saas-button saas-button-block" type="submit">
          Zaloguj się
        </button>
      </form>
      <Link href="/password-reset" className="saas-inline-link">
        Nie pamiętasz hasła?
      </Link>
    </AuthShell>
  );
}
