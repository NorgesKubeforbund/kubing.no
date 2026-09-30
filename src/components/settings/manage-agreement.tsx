"use client";

import BlueLink from "@/components/ui/blue-link";
import { useRouter } from "next/navigation";

export default function ManageAgreement({ hasActiveAgreement }: { hasActiveAgreement: boolean }) {
  const router = useRouter();
  async function stopAgreement() {
    if (!confirm("Er du sikker på at du vil avslutte fast betaling?")) {
      return;
    }
    const res = await fetch("/api/membership/automatic", {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Noe gikk galt.");
      return;
    }
    router.refresh();
  }

  if (!hasActiveAgreement) {
    return (
      <div>Du har ikke fast betaling på. Du kan sette opp dette på <BlueLink href="/min-side">Min side</BlueLink>.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>Du kan når som helst avslutte fast betaling her eller direkte i Vipps.</div>
      <button
        onClick={stopAgreement}
        className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit self-center"
      >
        Avslutt fast betaling
      </button>
    </div>
  );
}
