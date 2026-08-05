import { NextRequest, NextResponse } from "next/server";
import { getWCATokens, getWCAUserInfo } from "@/lib/wca-oauth";
import { createSession, setAuthCookies } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const url = getBaseUrl()
  const code = req.nextUrl.searchParams.get("code") || null;
  if (!code) {
    return NextResponse.redirect(new URL("/login?error", url));
  }
  const wcaTokensRes = await getWCATokens(code, url);
  if (!wcaTokensRes.success) {
    return NextResponse.redirect(new URL("/login?error", url));
  }
  const wcaTokens = wcaTokensRes.data;
  const userRes = await getWCAUserInfo(wcaTokensRes.data.access_token);
  if (!userRes.success) {
    return NextResponse.redirect(new URL("/login?error", url));
  }
  const user = userRes.data;
  const tokens = await createSession(wcaTokens, user);
  const res = NextResponse.redirect(new URL("/min-side", url));
  setAuthCookies(res, tokens);
  return res;
}
