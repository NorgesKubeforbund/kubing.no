import { NextRequest, NextResponse } from "next/server";
import { getWCATokens, getWCAUserInfo } from "@/app/utils/wca-oauth-utils";
import { createSession, setAuthCookies } from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";

export async function GET(req: NextRequest) {
  const url = getBaseUrl(req)
  const code = req.nextUrl.searchParams.get("code") || null;
  if (!code) {
    return NextResponse.redirect(new URL("/login?error", url));
  }
  const wcaTokens = await getWCATokens(code, url);
  const user = await getWCAUserInfo(wcaTokens.access_token, wcaTokens.refresh_token, url);

  const tokens = await createSession(wcaTokens, user);
  const res = NextResponse.redirect(new URL("/min-side", url));
  setAuthCookies(res, tokens);
  return res;
}
