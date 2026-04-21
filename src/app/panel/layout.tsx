import { logoutUserAction } from "@/app/account/actions";
import { PanelShell } from "@/components/user/panel-shell";
import { getAuthenticatedAppUser } from "@/lib/app-auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, membership, organization } = await getAuthenticatedAppUser();

  return (
    <PanelShell
      email={profile.email}
      fullName={profile.full_name}
      role={membership.role}
      organizationName={organization.name}
      logoutAction={logoutUserAction}
    >
      {children}
    </PanelShell>
  );
}
