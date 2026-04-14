import { logoutAdminAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getAuthenticatedAdmin();

  return (
    <AdminShell
      email={profile.email || user.email || "administrator"}
      role={profile.role}
      logoutAction={logoutAdminAction}
    >
      {children}
    </AdminShell>
  );
}