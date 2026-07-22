import Title from "@/app/ui/title";
import { getSessionToken } from "@/app/utils/auth-utils";
import BlueLink from "@/app/ui/blue-link";
import BliMedlemButton from "@/app/components/bli-medlem-button";
import { isUserMember } from "@/app/utils/user-utils";
import MembershipBadge from "@/app/components/membership-badge";
import { getCurrentYear } from "../utils/time-utils";

async function MyPage() {
  const userId = (await getSessionToken()).payload.userId as number;
  const isMember = await isUserMember(userId);
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
          <BliMedlemButton paymentType="vipps" />
          <BliMedlemButton paymentType="card" />
        </div>
      )}
      <BlueLink href="/min-side/innstillinger">Innstillinger</BlueLink>
    </div>
  );
}

export default MyPage;
