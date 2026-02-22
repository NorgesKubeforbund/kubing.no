import Title from "@/app/ui/title";
import UserData from "../components/user-data";
import { getSessionToken } from "../utils/auth-utils";

async function MyPage() {
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Min side</Title>
      <UserData userId={(await getSessionToken()).payload.userId as number} />
    </div>
  );
}

export default MyPage;
