"use client"

import Title from "@/app/ui/title";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

function RegisterUser() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  function registerUser(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true);
    fetch("/api/user", {
      method: "POST",
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
      <form onSubmit={registerUser}>
        <input
          disabled={loading}
          type="submit"
          value="Lag bruker"
          className="bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit"
        />
      </form>
    </div>
  )
}

export default RegisterUser;
