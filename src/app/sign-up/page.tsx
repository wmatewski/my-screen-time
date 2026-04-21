import Link from "next/link";
import { redirect } from "next/navigation";

import { registerUserAction } from "@/app/account/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { getOptionalAuthenticatedAppUser } from "@/lib/app-auth";
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
    return { type: "error", message: "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie." };
  }

  return null;
};

export default async function SignUpPage({
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
      eyebrow="Rejestracja"
      title="Załóż organizację i uruchom pierwszy dashboard sesji."
      description="Po rejestracji od razu trafisz do nowego workspace Wojticore Flowa i stworzysz pierwszą sesję z linkiem QR."
      footer={
        <>
          Masz już konto? <Link href="/login">Zaloguj się</Link>
        </>
      }
    >
      {flash ? <div className={`saas-alert ${flash.type}`}>{flash.message}</div> : null}
      <form action={registerUserAction} className="saas-form-grid">
        <label className="saas-field">
          <span>Imię i nazwisko</span>
          <input type="text" name="fullName" required minLength={2} placeholder="Jan Kowalski" />
        </label>
        <label className="saas-field">
          <span>Nazwa organizacji</span>
          <input type="text" name="organizationName" required minLength={2} placeholder="Twoja organizacja" />
        </label>
        <label className="saas-field">
          <span>E-mail</span>
          <input type="email" name="email" required placeholder="twoj@adres.pl" />
        </label>
        <label className="saas-field">
          <span>Hasło</span>
          <input type="password" name="password" required minLength={8} placeholder="Co najmniej 8 znaków" />
        </label>
        <label className="saas-field">
          <span>Powtórz hasło</span>
          <input type="password" name="confirmPassword" required minLength={8} placeholder="Powtórz hasło" />
        </label>
        <button className="saas-button saas-button-block" type="submit">
          Załóż konto
        </button>
      </form>
    </AuthShell>
  );
}
