import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getAllMembers } from "@/lib/membership";
import { getCurrentYear } from "@/lib/time";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("membership_list")) {
    redirect("/admin");
  }
  const members = await getAllMembers(getCurrentYear());

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Medlemsliste</Title>
      <table>
        <thead>
          <tr>
            <th>Navn</th>
            <th>WCA ID</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member =>
            <tr key={member.wcaId}>
              <td>{member.name}</td>
              <td>{member.wcaId ?? "Ingen WCA ID"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
