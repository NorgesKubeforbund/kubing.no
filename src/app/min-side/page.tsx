import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import BlueLink from "@/components/ui/blue-link";
import BecomeMemberButtons from "@/components/become-member-buttons";
import { isUserMember } from "@/lib/membership";
import { redirect } from "next/navigation";
import RegisterUser from "@/components/forms/register-user";
import { getUser } from "@/lib/user";
import { hasUserActiveAgreement } from "@/lib/agreement";
import WaitForOpenOrder from "@/components/settings/wait-for-open-order";
import { getMembershipCostRoundedString } from "@/lib/vipps/util";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ vipps?: string }>
}) {
  const { isAuthenticated, userId, permissions } = await getAuth();
  if (!isAuthenticated) {
    redirect("/login");
  }
  if (userId === null) {
    return <RegisterUser />;
  }

  const { vipps } = await searchParams;
  if (vipps === "avtale" || vipps === "betaling") {
    return <WaitForOpenOrder type={vipps} />
  }
  
  const user = await getUser(userId);
  const isMember = await isUserMember(userId);
  const hasActiveAgreement = await hasUserActiveAgreement(userId);
  const hasPermissions = (permissions?.length ?? 0) > 0;

  return (
    <div className="flex flex-col min-h-[50vh] px-4 sm:px-8 gap-8 text-center max-w-5xl">
      <div className="flex flex-col gap-2">
        <Title>Min side</Title>
        {user.success && <div className="text-base">Hei {user.data.name.split(" ")[0]}!</div>}
      </div>
      <MembershipBadge isMember={isMember} hasActiveAgreement={hasActiveAgreement} />
      <BecomeMemberButtons isMember={isMember} hasActiveAgreement={hasActiveAgreement} membershipCost={getMembershipCostRoundedString()}/>
      <div className="flex flex-col gap-4 mt-auto">
        <BlueLink href="/min-side/innstillinger">Innstillinger</BlueLink>
        {hasPermissions && <BlueLink href="/admin">Admin-side</BlueLink>}
      </div>
    </div>
  );
}

function MembershipBadge({
  isMember,
  hasActiveAgreement,
}: {
  isMember: boolean;
  hasActiveAgreement: boolean;
}) {
  if (isMember) return <IsMemberBadge />;
  if (hasActiveAgreement) return <RenewalPendingBadge />;
  return <NotMemberBadge />;
}

function IsMemberBadge() {
  return (
    <div className="mt-6 bg-green-600 border-4 border-green-700 text-white rounded-xl p-4 w-fit self-center">
      <div className="text-2xl font-semibold">Aktivt medlemskap i NKF</div>
      <p>Medlemskapet varer ut inneværende kalenderår.</p>
    </div>
  );
}

function RenewalPendingBadge() {
  return (
    <div className="mt-6 bg-yellow-500 border-4 border-yellow-600 text-white rounded-xl p-4 w-fit self-center">
      <div className="text-2xl font-semibold">Medlemskapet fornyes snart</div>
      <p>Du har automatisk fornyelse og medlemskapet ditt vil bli fornyet automatisk om kort tid.</p>
    </div>
  );
}

function NotMemberBadge() {
  return (
    <div className="bg-red-600 border-4 border-red-700 text-white rounded-xl p-4 w-fit self-center">
      <div className="text-2xl font-semibold">Ingen medlemskap i NKF</div>
      <p>Medlemskapet følger kalenderåret og må fornyes hvert år.</p>
    </div>
  );
}
