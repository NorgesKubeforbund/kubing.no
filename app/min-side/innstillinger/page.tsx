import AddressUpdateForm from "@/app/components/address-update-form";
import UserData from "@/app/components/user-data";
import Title from "@/app/ui/title";
import { getSessionToken } from "@/app/utils/auth-utils";

async function Settings() {
  const userId = (await getSessionToken()).payload.userId as number;

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Innstillinger</Title>
      <div className="flex flex-col gap-4">
        <Title>Personlig data</Title>
        <UserData userId={userId} />
      </div>
      <div className="flex flex-col gap-4">
        <Title>Endre adresse</Title>
        <AddressUpdateForm />
      </div>
      <div className="flex flex-col gap-4">
        <Title>Oppdater data fra WCA</Title>
      </div>
      <div className="flex flex-col gap-4">
        <Title>Slett bruker</Title>
      </div>
    </div>
  );
}


export default Settings;
