"use client";

import BlueLink from "@/components/ui/blue-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/button";

export default function ManageAgreement({ hasActiveAgreement }: { hasActiveAgreement: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  async function stopAgreement() {
    if (!confirm("Er du sikker på at du vil avslutte automatisk fornyelse?")) {
      return;
    }
    setLoading(true);
    const res = await fetch("/api/membership/automatic", {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Noe gikk galt.");
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  if (!hasActiveAgreement) {
    return (
      <div>Du har ikke automatisk fornyelse. Du kan sette opp dette på <BlueLink href="/min-side">Min side</BlueLink>.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>Du kan når som helst avslutte automatisk fornyelse her eller direkte i Vipps.</div>
      <Button
        onClick={stopAgreement}
        disabled={loading}
        variant="danger"
        className="self-center"
      >
        Avslutt automatisk fornyelse
      </Button>
    </div>
  );
}
