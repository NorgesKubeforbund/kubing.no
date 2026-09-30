"use client";

import { useState } from "react";

export default function UpdateWCAUserData() {
  const [loading, setLoading] = useState<boolean>(false);
  async function updateWCAUserData() {
    setLoading(true);
    const res = await fetch("/api/user/refresh-wca",
      {
        method: "POST"
      }
    );
    if (!res.ok) {
      alert("Noe gikk galt");
      setLoading(false);
      return;
    }
    alert("Informasjon oppdatert");
    window.location.reload()
  }
  return (
    <div className="flex flex-col gap-4">
      <p>
        Hvis du trykker på knappen nedenfor, vil vi på nytt hente inn
        din personlige informasjon fra WCA.
        Har du endret navn eller e-post på WCA, er dette måten du kan
        oppdatere informasjonen vi har om deg. Slik at vi har
        riktig navn og kontaktinformasjon.
      </p>
      <button
        onClick={() => updateWCAUserData()}
        className="self-center bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit"
        disabled={loading}
      >
        Oppdater informasjon
      </button>
    </div>
  );
}
