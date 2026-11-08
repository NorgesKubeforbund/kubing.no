"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/button";

export default function LoginButton({ redirect }: { redirect?: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function login() {
    setLoading(true);
    const res = await fetch(`/api/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`);
    if (!res.ok) {
      setLoading(false);
      alert("Noe gikk galt");
      return;
    }
    const { wcaLoginUrl } = await res.json();
    router.push(wcaLoginUrl);
    setLoading(false);
  }

  return (
    <Button
      disabled={loading}
      onClick={login}
      className="w-full gap-3"
    >
      <Image
        src="/wca-logo.svg"
        alt=""
        width={24}
        height={24}
        className="p-0.5 rounded-sm h-6 w-6 bg-white"
      />
      <div>Logg inn med WCA</div>
    </Button>
  );
}
