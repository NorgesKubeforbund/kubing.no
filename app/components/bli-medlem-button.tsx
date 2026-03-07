"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function BliMedlemButton({ paymentType }: { paymentType: "vipps" | "card" }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  async function redirectToVipps() {
    setLoading(true);
    const res = await fetch(`/api/membership/${paymentType}`,
      {
        method: "POST"
      }
    );
    if (!res.ok) {
      alert("Noe gikk galt...");
      setLoading(false);
      return;
    }
    const url = (await res.json() as { url: string }).url;
    router.push(url);
  }
  return (
    <div>
      <button
        disabled={loading}
        onClick={redirectToVipps}
        className="bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit"
      >
        {paymentType === "vipps" ? "Betal med Vipps" : "Betal med kort"}
      </button>
    </div>
  )
}


export default BliMedlemButton;
