"use client";

import { getWCALoginUrl } from "@/lib/wca-oauth";
import { useState } from "react";
import { useRouter } from "next/navigation";

function LoginButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  function login() {
    setLoading(true);
    router.push(getWCALoginUrl(window.location.origin, clientId));
  }

  return (
    <button
      disabled={loading}
      onClick={login}
      type="submit"
      value="Lag bruker"
      className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit"
    >
      Logg inn med WCA
    </button>
  )
}

export default LoginButton;
