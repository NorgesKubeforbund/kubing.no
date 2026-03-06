import AddressForm from "@/app/components/address-form";
import Title from "@/app/ui/title";

function Settings() {
  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center">
      <Title>Innstillinger</Title>
      <div className="flex flex-col gap-4">
        <Title>Endre adresse</Title>
        <form className="flex flex-col gap-4">
          <AddressForm />
          <input type="submit" value="Oppdater adresse" className="self-center bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit" />
        </form>
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
