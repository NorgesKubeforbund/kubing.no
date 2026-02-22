"use client";

import { getWCALoginUrl } from "@/app/utils/wca-oauth-utils";
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
      className="bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit"
    >
      Logg inn med WCA
    </button>
  )
}

export default LoginButton;
