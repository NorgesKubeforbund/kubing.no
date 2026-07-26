import { NextResponse } from "next/server";
import { getAuth, setAuthCookies, updateTokens } from "@/lib/auth";

export async function proxy() {
  const { isAuthenticated, refreshToken } = await getAuth();
  const res = NextResponse.next();
  if (isAuthenticated || !refreshToken) {
    return res;
  }
  const tokenCreation = await updateTokens(refreshToken, false);
  if (!tokenCreation.success) {
    return res;
  }
  setAuthCookies(res, tokenCreation.tokens);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
