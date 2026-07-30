"use client";

import { VippsPaymentType } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BecomeMemberButtons() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
    <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 sm:justify-items-stretch">
      <button
        disabled={loading}
        onClick={() => redirectToVipps("WALLET")}
        className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-end"
      >
        Betal med Vipps
      </button>
      <button
        disabled={loading}
        onClick={() => redirectToVipps("CARD")}
        className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-start"
      >
        Betal med kort
      </button>
    </div>
  );
}
