import { NextRequest, NextResponse } from "next/server";
import { getAuth, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME, setAuthCookies, updateTokens } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { isAuthenticated, refreshToken } = await getAuth();
  if (isAuthenticated || !refreshToken) {
    return NextResponse.next();
  }
  const tokenCreation = await updateTokens(refreshToken, false);
  if (!tokenCreation.success) {
    return NextResponse.next();
  }
  req.cookies.set(SESSION_TOKEN_NAME, tokenCreation.tokens.sessionToken);
  req.cookies.set(REFRESH_TOKEN_NAME, tokenCreation.tokens.refreshToken);
  const res = NextResponse.next({ request: req })
  setAuthCookies(res, tokenCreation.tokens);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
