import AddressUpdateForm from "@/components/forms/address-update-form";
import UpdateWCAUserData from "@/components/update-wca-user-data";
import UserData from "@/components/user-data";
import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getUserData } from "@/lib/user";
import { notFound } from "next/navigation";

async function Settings() {
  const { userId } = await getAuth()
  const userDataRes = await getUserData(userId!);
  if (!userDataRes.success) {
    notFound();
  }
  const userData = userDataRes.data;
  return (
    <div className="flex flex-col px-4 sm:px-8 max-w-5xl gap-8 text-center">
      <Title>Innstillinger</Title>
      <div className="flex flex-col gap-4">
        <Title small>Personlig data</Title>
        <UserData userData={userData} />
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
