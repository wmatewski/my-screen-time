import { LayoutDashboard, LogOut, Users } from "lucide-react";
import Link from "next/link";

import { formatRole } from "@/lib/format";
import type { OrganizationRole } from "@/lib/types";

interface PanelShellProps {
  email: string;
  fullName: string;
  role: OrganizationRole;
  organizationName: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export const PanelShell = ({
  email,
  fullName,
  role,
  organizationName,
  logoutAction,
  children,
}: PanelShellProps) => {
  return (
    <main className="site-shell">
      <div className="admin-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <Users size={22} />
            </div>
            <div className="brand-copy">
              <strong>Aura Clarity</strong>
              <span>Panel użytkownika</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link className="sidebar-link active" href="/panel">
              <LayoutDashboard size={18} />
              Moje sesje
            </Link>
            <Link className="sidebar-link" href="/">
              Wróć na stronę główną
            </Link>
          </nav>

          <div className="soft-card sidebar-footer">
            <div className="subtle-label">Organizacja</div>
            <strong style={{ display: "block", marginTop: 10 }}>{organizationName}</strong>
            <p className="muted" style={{ marginBottom: 8 }}>{fullName}</p>
            <p className="muted" style={{ marginBottom: 0 }}>
              {email} · {formatRole(role)}
            </p>
            <form action={logoutAction} style={{ marginTop: 16 }}>
              <button className="primary-button" type="submit" style={{ width: "100%" }}>
                <LogOut size={18} />
                Wyloguj
              </button>
            </form>
          </div>
        </aside>

        <section className="admin-main">{children}</section>
      </div>
    </main>
  );
};
