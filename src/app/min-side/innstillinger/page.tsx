import AddressUpdateForm from "@/app/components/address-update-form";
import UpdateWCAUserData from "@/app/components/update-wca-user-data";
import UserData from "@/app/components/user-data";
import BlueLink from "@/app/ui/blue-link";
import Title from "@/app/ui/title";
import { getSessionToken } from "@/app/utils/auth-utils";

async function Settings() {
  const userId = (await getSessionToken()).payload.userId as number;

  return (
    <div className="flex flex-col px-4 sm:px-8 max-w-5xl gap-8 text-center">
      <Title>Innstillinger</Title>
      <div className="flex flex-col gap-4">
        <Title small>Personlig data</Title>
        <UserData userId={userId} />
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Endre adresse</Title>
        <AddressUpdateForm />
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Oppdater informasjon fra WCA</Title>
        <UpdateWCAUserData />
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Andre handlinger</Title>
        <p>
          For andre endringer, korrigeringer eller sletting av brukeren din, ber vi deg ta
          kontakt via <BlueLink href="/om-oss#kontakt-oss">kontaktskjemaet</BlueLink>,
          så hjelper vi deg med hva enn det måtte være.
          <br />
          Vi gjør oppmerksom på at ved sletting av brukeren din, vil betalt
          medlemskontigent <u>ikke</u> bli tilbakebetalt.
        </p>
      </div>
    </div>
  );
}


export default Settings;
