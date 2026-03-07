import Title from "@/app/ui/title";
import UserData from "../components/user-data";
import { getSessionToken } from "../utils/auth-utils";
import BliMedlemButton from "../components/bli-medlem-button";
import { isUserMember } from "../utils/user-utils";

async function MyPage() {
  const userId = (await getSessionToken()).payload.userId as number;
  const isMember = await isUserMember(userId);
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Min side</Title>
      <UserData userId={userId} />
      {isMember || (
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-semibold text-accent-text">Bli medlem</div>
          <BliMedlemButton paymentType="vipps" />
          <BliMedlemButton paymentType="card" />
        </div>
      )}
    </div>
  );
}

export default MyPage;
