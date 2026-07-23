import { getRefreshToken, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME, setAuthCookies, updateTokens } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("returnTo");
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    const fallbackRes = returnTo ? NextResponse.redirect(new URL("/login", getBaseUrl(req))) : NextResponse.json({}, { status: 401 });
    fallbackRes.cookies.delete(REFRESH_TOKEN_NAME);
    fallbackRes.cookies.delete(SESSION_TOKEN_NAME);
    return fallbackRes;
  }
  const tokens = await updateTokens(refreshToken);
  const res = returnTo ? NextResponse.redirect(new URL(returnTo)) : NextResponse.json({});
  setAuthCookies(res, tokens);
  return res;
}
