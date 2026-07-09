"use client"

import Title from "@/app/ui/title";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import AddressForm from "./address-form";

function RegisterUser() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [hasNotNorwegianAddress, setHasNotNorwegianAddress] = useState<boolean>(false);
  const [fieldsFilled, setFieldsFilled] = useState<boolean>(false);

  function registerUser(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const address = formData.get("address");
    const postCode = formData.get("postCode");
    const postArea = formData.get("postArea");
    const body = !hasNotNorwegianAddress ? {
      address: {
        address: address,
        postCode: postCode,
        postArea: postArea,
      }
    } : {};
    fetch("/api/user", {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then(res => {
        if (!res.ok) {
          alert("Noe gikk galt...");
        }
        router.refresh();
      })
      .catch(() => {
        alert("Noe gikk galt...");
      }).finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-16 text-center">
      <Title>Registrer deg</Title>
      <p>Når du lager en bruker vil vi lagre navn, WCA ID, epost og fødselsdato som er knyttet til din WCA bruker.</p>
      <form onSubmit={registerUser} className="flex flex-col gap-4 items-center" >
        <AddressForm setFieldsFilled={setFieldsFilled} />
        <label className="flex flex-row gap-4">
          <div>Har ikke norsk adresse:</div>
          <input type="checkbox" checked={hasNotNorwegianAddress} onChange={(e) => setHasNotNorwegianAddress(e.target.checked)}/>
        </label>
        <input
          disabled={(!fieldsFilled && !hasNotNorwegianAddress) || loading}
          type="submit"
          value="Lag bruker"
          className="bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit"
        />
      </form>
    </div>
  )
}

export default RegisterUser;
