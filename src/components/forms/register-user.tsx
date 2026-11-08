"use client"

import Title from "@/components/ui/title";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import AddressForm from "@/components/forms/address-form";
import Button from "@/components/ui/button";

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
      <p>Når du lager en bruker vil vi lagre navn, WCA ID, e-post og fødselsdato som er knyttet til din WCA bruker.</p>
      <form
        onSubmit={registerUser}
        className="flex w-full max-w-xl flex-col gap-5 self-center rounded-lg border border-neutral-300 bg-white p-4 text-left sm:p-5"
      >
        <AddressForm
          key={String(hasNotNorwegianAddress)}
          setFieldsFilled={setFieldsFilled}
          disabled={hasNotNorwegianAddress}
        />
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={hasNotNorwegianAddress}
            onChange={(e) => {
              setHasNotNorwegianAddress(e.target.checked);
              setFieldsFilled(false);
            }}
            className="h-4 w-4 cursor-pointer accent-neutral-900"
          />
          <span>Jeg har ikke norsk adresse</span>
        </label>
        <Button
          disabled={(!fieldsFilled && !hasNotNorwegianAddress) || loading}
          type="submit"
          className="w-full"
        >
          {loading ? "Lager bruker..." : "Lag bruker"}
        </Button>
      </form>
    </div>
  )
}

export default RegisterUser;
