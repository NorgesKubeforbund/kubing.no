import AddressUpdateForm from "@/components/forms/address-update-form";
import UpdateWCAUserData from "@/components/settings/update-wca-user-data";
import UserData from "@/components/settings/user-data";
import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getUserData } from "@/lib/user";
import { notFound, redirect } from "next/navigation";
import BackArrow from "@/components/ui/back-arrow";
import ManageAgreement from "@/components/settings/manage-agreement";

export default async function SettingsPage() {
  const { isAuthenticated, userId } = await getAuth()
  if (!isAuthenticated) {
    redirect("/login?redirect=/min-side/innstillinger");
  }
  if (userId === null) {
    redirect("/min-side");
  }
  const userDataRes = await getUserData(userId);
  if (!userDataRes.success) {
    notFound();
  }
  const userData = userDataRes.data;
  return (
    <div className="flex flex-col px-4 sm:px-8 max-w-5xl gap-8 text-center">
      <div className="flex flex-col gap-2">
        <BackArrow href="/min-side" />
        <Title>Innstillinger</Title>
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Fast betaling</Title>
        <ManageAgreement hasActiveAgreement={userData.hasActiveAgreement} />
      </div>
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
