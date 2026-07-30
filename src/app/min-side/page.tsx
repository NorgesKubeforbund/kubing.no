import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import BlueLink from "@/components/ui/blue-link";
import BecomeMemberButtons from "@/components/become-member-buttons";
import { isUserMember } from "@/lib/membership";
import { getCurrentYear } from "@/lib/time";
import { claimMembership } from "@/lib/vipps";

export default async function MyPage() {
  const { userId } = await getAuth();
  const isMember = await isUserMember(userId!) || await claimMembership(userId!);

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Min side</Title>
      <MembershipBadge isMember={isMember} />
      {!isMember && (
        <div className="flex flex-col gap-4">
          <Title small>Bli medlem</Title>
          {getCurrentYear() === 2026 &&
            <p>
              Hvis du betalte medlemskontigent før den nye betalingsløsningen,
              ta kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
            </p>
          }
          <BecomeMemberButtons />
        </div>
      )}
      <BlueLink href="/min-side/innstillinger">Innstillinger</BlueLink>
    </div>
  );
}

function MembershipBadge({ isMember }: { isMember: boolean }) {
  return isMember ? <IsMemberBadge /> : <NotMemberBadge />;
}

function IsMemberBadge() {
  return (
    <div className="bg-green-600 border-4 border-green-700 text-white rounded-xl p-4">
      <div className="text-2xl font-semibold">Aktivt medlemskap i NKF</div>
      <p>Medlemskapet varer ut inneværende kalenderår.</p>
    </div>
  );
}

function NotMemberBadge() {
  return (
    <div className="bg-red-600 border-4 border-red-700 text-white rounded-xl p-4">
      <div className="text-2xl font-semibold">Ingen medlemskap i NKF</div>
      <p>Medlemskapet følger kalenderåret og må fornyes hvert år.</p>
    </div>
  );
}
