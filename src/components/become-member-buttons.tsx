"use client";

import { VippsPaymentType } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CreditCardIcon, InfoIcon } from "lucide-react";
import BlueLink from "@/components/ui/blue-link";
import Title from "@/components/ui/title";
import { getCurrentYear } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function BecomeMemberButtons({
  isMember,
  hasActiveAgreement,
}: {
  isMember: boolean;
  hasActiveAgreement: boolean;
}) {
  const router = useRouter();
  const year = getCurrentYear();
  const [loading, setLoading] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [recurring, setRecurring] = useState<boolean>(isMember);
  const [paymentType, setPaymentType] = useState<VippsPaymentType>("WALLET");

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
    const agreementCreation = (await res.json()) as { url: string };
    router.push(agreementCreation.url);
  }

  if (hasActiveAgreement) {
    return null;
  }

  const walletSelected = recurring || paymentType === "WALLET";

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Title small>{!isMember ? "Bli medlem" : "Start fast betaling"}</Title>
      {!isMember && year === 2026 && (
        <p className="text-lg">
          Hvis du betalte medlemskontigent før den nye betalingsløsningen,
          ta kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
        </p>
      )}

      <div className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        {!isMember && (
          <div className="flex gap-1 rounded-lg bg-neutral-200 p-1">
            <button
              onClick={() => setRecurring(false)}
              className={cn(
                "flex-1 cursor-pointer rounded-md px-3 py-2 transition-colors",
                !recurring ? "bg-white" : "not-hover:text-neutral-600 hover:bg-neutral-300",
              )}
            >
              Betal én gang
            </button>
            <button
              onClick={() => setRecurring(true)}
              className={cn(
                "flex-1 cursor-pointer rounded-md px-3 py-2 transition-colors",
                recurring ? "bg-white" : "not-hover:text-neutral-600 hover:bg-neutral-300",
              )}
            >
              Fast betaling
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-lg">Betalingsmetode</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPaymentType("WALLET")}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors group",
                walletSelected ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-500",
              )}
            >
              <Image
                src="/vipps-pay-mark.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="flex-1">Vipps</span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  walletSelected ? "border-neutral-900" : "border-neutral-300",
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", walletSelected ? "bg-neutral-900" : "group-hover:bg-neutral-400")} />
              </span>
            </button>
            {!recurring && (
              <button
                onClick={() => setPaymentType("CARD")}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors group",
                  !walletSelected ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-500",
                )}
              >
                <CreditCardIcon className="h-5 w-5" />
                <span className="flex-1">Kort</span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    !walletSelected ? "border-neutral-900" : "border-neutral-300",
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", !walletSelected ? "bg-neutral-900" : "group-hover:bg-neutral-400")} />
                </span>
              </button>
            )}
          </div>
          {recurring && (
            <p className="text-sm text-neutral-500">
              Fast betaling er kun tilgjengelig med Vipps.
            </p>
          )}
        </div>

        {isMember && (
          <div className="flex gap-3 rounded-lg bg-neutral-100 p-4 text-neutral-800">
            <InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Du er allerede medlem i år og betaler ingenting nå.
              Neste betaling gjelder {year + 1} og vil trekkes i
              starten av året.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 border-t border-neutral-200 pt-6">
          {!isMember && (
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-baseline justify-between gap-4">
                <p>Medlemskap {year}</p>
                <p>100 kr</p>
              </div>
              {recurring && (
                <p className="text-left text-sm text-neutral-500">
                  Fornyes hvert år med fast betaling
                </p>
              )}
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer accent-neutral-900"
            />
            <p>
              Jeg bekrefter at jeg har lest og samtykker til innholdet
              i <BlueLink href="/NKF-medlem-salgskontrakt.pdf">salgsavtalen</BlueLink>.
            </p>
          </label>

          <button
            disabled={loading || !consent}
            onClick={() =>
              recurring ? redirectToAutomaticVipps() : redirectToVipps(paymentType)
            }
            className="w-full cursor-pointer rounded-lg bg-link-text px-4 py-3 text-white transition-colors hover:bg-link-text/85 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:hover:bg-neutral-100"
          >
            {loading
              ? "Venter..."
              : recurring
                ? "Start fast betaling med Vipps"
                : `Betal med ${paymentType === "WALLET" ? "Vipps" : "kort"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
