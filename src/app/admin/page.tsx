import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { UserPermission } from "@/types";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { permissions } = await getAuth();
  const hasPermissions = (permissions?.length ?? 0) > 0;
  if (!permissions || !hasPermissions) {
    redirect("/");
  }

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Admin-side</Title>
      {permissions.map(permission => <PermissionLink key={permission} permission={permission} />)}
    </div>
  );
}

function PermissionLink({
  permission,
}: {
  permission: UserPermission;
}) {
  switch (permission) {
    case "membership_list":
      return <BlueLink href="/admin/medlemmer">Medlemsliste</BlueLink>
    case "members_comp":
      return <BlueLink href="/admin/medlemmer-konkurranse">Medlemmer på konkurranse</BlueLink>;
  }
}
