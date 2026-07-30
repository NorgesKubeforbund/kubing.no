import ExportComps from "@/components/admin/export-comp";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getNorwayCompData } from "@/lib/comps";
import { redirect } from "next/navigation";

export default async function MembersInComp() {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("members_comp")) {
    redirect("/admin");
  }
  const norwayCompData = await getNorwayCompData();
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Medlemmer på konkurranse</Title>
      <ExportComps norwayCompData={norwayCompData} />
    </div>
  );
}
