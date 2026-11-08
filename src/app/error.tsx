"use client";

import BlueLink from "@/components/ui/blue-link";
import { useEffect } from "react";
import Button from "@/components/ui/button";

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
      <Button
        onClick={retry}
        className="self-center"
      >
        Prøv igjen
      </Button>
    </div>
  );
}
