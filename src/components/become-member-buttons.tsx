"use client";

import { VippsPaymentType } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlueLink from "@/components/ui/blue-link";

export default function BecomeMemberButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setLoading(false);
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function redirectToVipps(paymentType: VippsPaymentType) {
    setLoading(true);
    const res = await fetch(`/api/membership/pay/${paymentType}`, {
      method: "POST",
    });
    if (!res.ok) {
      alert("Noe gikk galt...");
      setLoading(false);
      return;
    }
    const orderCreation = (await res.json() as { hasPaid: false; url: string } | { hasPaid: true });
    if (orderCreation.hasPaid) {
      router.refresh();
    } else {
      router.push(orderCreation.url);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="cursor-pointer"
        />
        <p>Jeg bekrefter at jeg har lest og samtykker til innholdet i <BlueLink href="/NKF-medlem-salgskontrakt.pdf">salgsavtalen</BlueLink>.</p>
      </label>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 sm:justify-items-stretch">
        <button
          disabled={loading || !consent}
          onClick={() => redirectToVipps("WALLET")}
          className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-end"
        >
          Betal med Vipps
        </button>
        <button
          disabled={loading || !consent}
          onClick={() => redirectToVipps("CARD")}
          className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-start"
        >
          Betal med kort
        </button>
      </div>
    </div>
  );
}
