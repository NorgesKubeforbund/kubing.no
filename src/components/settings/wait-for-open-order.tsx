"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WaitForOpenOrder({ type }: { type: "avtale" | "betaling" }) {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const start = Date.now();

    async function pollStatus() {
      while (!signal.aborted) {
        try {
          const res = await fetch(`/api/vipps/status?type=${type}`, { signal });
          const { status } = await res.json();
          if (status === "done") {
            router.replace("/min-side");
            router.refresh();
            return;
          }
        } catch {
          if (signal.aborted) {
            return;
          }
        }

        if (Date.now() - start > 60_000) {
          router.replace("/min-side");
          router.refresh();
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    pollStatus();
    return () => controller.abort();
  }, [type, router]);

  return (
    <div className="flex flex-col min-h-[50vh] px-4 sm:px-8 gap-8 text-center max-w-5xl">
      <div className="flex flex-col gap-8 m-auto">
        <LoaderCircleIcon size={64} className="animate-spin self-center " />
        <p>Vennligst vent...</p>
      </div>
    </div>
  );
}

