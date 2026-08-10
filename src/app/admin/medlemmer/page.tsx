import MembershipList from "@/components/admin/membership-list";
import BackArrow from "@/components/ui/back-arrow";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getAllMembers, getAllYearsWithMembers } from "@/lib/membership";
import { getCurrentYear } from "@/lib/time";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("membership_list")) {
    redirect("/admin");
  }
  const year = getCurrentYear();
  const years = await getAllYearsWithMembers();
  const members = await getAllMembers(year);

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <BackArrow href="/admin" />
        <Title>Medlemsliste</Title>
      </div>
      <MembershipList
        initialMembers={members}
        initialYear={year}
        years={years}
      />
    </div>
  );
}
