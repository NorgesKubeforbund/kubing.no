"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginButton({ redirect }: { redirect?: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function login() {
    setLoading(true);
    const res = await fetch(`/api/auth/login${redirect ? `?redirect=${redirect}` : ""}`);
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
    <button
      disabled={loading}
      onClick={login}
      className="flex flex-row items-center justify-center gap-3 w-full cursor-pointer rounded-lg bg-link-text px-4 py-2 text-white transition-colors hover:bg-link-text/85 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:hover:bg-neutral-100"
    >
      <Image
        src="/wca-logo.svg"
        alt=""
        width={32}
        height={32}
        className="p-1 rounded-sm h-8 w-8 bg-white"
      />
      <div>Logg inn med WCA</div>
    </button>
  );
}
