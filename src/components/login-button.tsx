"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginButton({ redirect }: { redirect?: string}) {
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
      className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit"
    >
      Logg inn med WCA
    </button>
  );
}
