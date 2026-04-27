import { CalendarRange, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import Link from "next/link";

import { formatMembershipRole } from "@/lib/format";
import type { MembershipRole } from "@/lib/types";

interface AdminShellProps {
  email: string;
  organizationName: string;
  role: MembershipRole;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export const AdminShell = ({
  email,
  organizationName,
  role,
  logoutAction,
  children,
}: AdminShellProps) => {
  return (
    <div className="wf-admin-layout">
      <aside className="wf-admin-sidebar">
        <div>
          <div className="wf-admin-brand">Panel Flowa</div>
          <div className="wf-admin-brand-subtitle">Zarządzaj spokojem</div>
        </div>

        <nav className="wf-admin-nav">
          <Link className="wf-admin-nav-link" href="/admin">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link className="wf-admin-nav-link" href="/admin/sessions">
            <CalendarRange size={18} />
            Moje Sesje
          </Link>
          <Link className="wf-admin-nav-link" href="/admin/organization">
            <Users size={18} />
            Organizacja
          </Link>
          <Link className="wf-admin-nav-link" href="/admin/sessions/new">
            <Settings size={18} />
            Ustawienia
          </Link>
        </nav>

        <div className="wf-admin-profile-card">
          <div className="wf-small-label">Aktywna organizacja</div>
          <div className="wf-admin-org-name">{organizationName}</div>
          <div className="wf-admin-profile-email">{email}</div>
          <div className="wf-pill wf-pill-soft">{formatMembershipRole(role)}</div>
          <form action={logoutAction}>
            <button className="wf-btn wf-btn-primary wf-btn-block" type="submit">
              <LogOut size={18} />
              Wyloguj
            </button>
          </form>
        </div>
      </aside>

      <section className="wf-admin-main">{children}</section>
    </div>
  );
};