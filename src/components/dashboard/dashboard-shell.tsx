import { BarChart3, DoorOpen, FolderKanban, Orbit, Users } from "lucide-react";
import Link from "next/link";

import { formatRole } from "@/lib/format";
import type { OrganizationRole } from "@/lib/types";

interface DashboardShellProps {
  activePage: "home" | "sessions";
  email: string;
  fullName: string;
  role: OrganizationRole;
  organizationName: string;
  sessionsCount: number;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

const navigation = [
  { key: "home", href: "/dashboard/home", label: "Strona główna", icon: BarChart3 },
  { key: "sessions", href: "/dashboard/sessions", label: "Sesje", icon: FolderKanban },
] as const;

export const DashboardShell = ({
  activePage,
  email,
  fullName,
  role,
  organizationName,
  sessionsCount,
  logoutAction,
  children,
}: DashboardShellProps) => {
  return (
    <main className="saas-dashboard-shell">
      <aside className="saas-sidebar">
        <div className="saas-sidebar-top">
          <div className="saas-logo-row">
            <div className="saas-logo-mark">
              <Orbit size={20} />
            </div>
            <div>
              <strong>Wojticore Flowa</strong>
              <p>Workspace</p>
            </div>
          </div>

          <nav className="saas-sidebar-nav">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`saas-sidebar-link ${activePage === item.key ? "is-active" : ""}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="saas-sidebar-bottom">
          <div className="saas-sidebar-summary">
            <span>Organizacja</span>
            <strong>{organizationName}</strong>
            <p>
              {fullName} · {formatRole(role)}
            </p>
            <p>{email}</p>
          </div>

          <div className="saas-sidebar-metrics">
            <div>
              <Users size={16} />
              <span>{sessionsCount} sesji</span>
            </div>
            <div>
              <FolderKanban size={16} />
              <span>Lewy sidebar przez całą wysokość</span>
            </div>
          </div>

          <form action={logoutAction}>
            <button className="saas-button saas-button-secondary saas-button-block" type="submit">
              <DoorOpen size={18} />
              Wyloguj
            </button>
          </form>
        </div>
      </aside>

      <section className="saas-dashboard-content">{children}</section>
    </main>
  );
};
