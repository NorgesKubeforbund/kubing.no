"use client";

import { VippsPaymentType } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";
import { getCurrentYear } from "@/lib/time";

export default function BecomeMemberButtons({
  isMember,
  hasActiveAgreement,
}: {
  isMember: boolean;
  hasActiveAgreement: boolean
}) {
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

  async function redirectToAutomaticVipps() {
    setLoading(true);
    const res = await fetch(`/api/membership/automatic`, {
      method: "POST",
    });
    if (!res.ok) {
      alert("Noe gikk galt...");
      setLoading(false);
      return;
    }
    const agreementCreation = await res.json() as { url: string };
    router.push(agreementCreation.url);
  }

  if (hasActiveAgreement) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Title small>{!isMember ? "Bli medlem" : "Start fast betaling"}</Title>
      {!isMember && getCurrentYear() === 2026 &&
        <p className="mb-4 text-lg">
          Hvis du betalte medlemskontigent før den nye betalingsløsningen,
          ta kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
        </p>
      }

      <div className="flex flex-col gap-4">
        <label className="flex gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="cursor-pointer"
          />
          <p className="text-lg">Jeg bekrefter at jeg har lest og samtykker til innholdet i <BlueLink href="/NKF-medlem-salgskontrakt.pdf">salgsavtalen</BlueLink>.</p>
        </label>
        {!isMember &&
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
        }
        <div className="flex justify-center">
          <button
            disabled={loading || !consent}
            onClick={() => redirectToAutomaticVipps()}
            className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit"
          >
            Fast betaling med Vipps
          </button>
        </div>
      </div>
    </div>
  );
}
