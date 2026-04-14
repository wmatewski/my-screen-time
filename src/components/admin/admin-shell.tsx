import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { formatRole } from "@/lib/format";
import type { AdminRole } from "@/lib/types";

interface AdminShellProps {
  email: string;
  role: AdminRole;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export const AdminShell = ({
  email,
  role,
  logoutAction,
  children,
}: AdminShellProps) => {
  return (
    <main className="site-shell">
      <div className="admin-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <ShieldCheck size={22} />
            </div>
            <div className="brand-copy">
              <strong>Aura Clarity</strong>
              <span>Panel administratora</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link className="sidebar-link active" href="/admin">
              <LayoutDashboard size={18} />
              Statystyki
            </Link>
          </nav>

          <div className="soft-card sidebar-footer">
            <div className="subtle-label">Zalogowano jako</div>
            <strong style={{ display: "block", marginTop: 10 }}>{email}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {formatRole(role)}
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