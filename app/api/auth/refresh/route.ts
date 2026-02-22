import { getRefreshToken, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME, setAuthCookies, updateTokens } from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("returnTo");

  const refreshToken = await getRefreshToken();
  const fallbackRes = returnTo ? NextResponse.redirect(new URL("/login", getBaseUrl(req))) : NextResponse.json({}, { status: 401 });
  fallbackRes.cookies.delete(REFRESH_TOKEN_NAME);
  fallbackRes.cookies.delete(SESSION_TOKEN_NAME);
  if (!refreshToken) {
    return fallbackRes;
  }
  const tokens = await updateTokens(refreshToken);
  if (!tokens) {
    return fallbackRes;
  }
  const res = returnTo ? NextResponse.redirect(new URL(returnTo)) : NextResponse.json({});
  setAuthCookies(res, tokens);
  return res;
}
