"use client";

import BlueLink from "@/components/ui/blue-link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col justify-center gap-4 p-4">
      <div className="text-2xl text-center">
        Det oppstod en uventet feil... <br />
        Hvis problemet vedvarer,
            ta kontakt <BlueLink href="/om-oss#kontakt-oss">her</BlueLink>.
      </div>
      <button
        onClick={retry}
        className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit self-center"
      >
        Prøv igjen
      </button>
    </div>
  );
}
