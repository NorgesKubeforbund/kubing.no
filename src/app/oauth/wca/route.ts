import { NextRequest, NextResponse } from "next/server";
import { getWCATokens, getWCAUserInfo } from "@/lib/wca-oauth";
import { createSession, setAuthCookies } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";

function redirectAndClearState(path: string) {
  const url = getBaseUrl();
  const res = NextResponse.redirect(new URL(path, url));
  res.cookies.delete("WCA_OAUTH_STATE");
  return res;
}

export async function GET(req: NextRequest) {
  const url = getBaseUrl();
  const code = req.nextUrl.searchParams.get("code") || null;
  const state = req.nextUrl.searchParams.get("state") || null;
  const storedState = req.cookies.get("WCA_OAUTH_STATE")?.value || null;

  if (!code) {
    return redirectAndClearState("/login?error");
  }

  if (!state || !storedState || state !== storedState) {
    return redirectAndClearState("/login?error");
  }

  const wcaTokensRes = await getWCATokens(code, url);
  if (!wcaTokensRes.success) {
    return redirectAndClearState("/login?error");
  }
  const wcaTokens = wcaTokensRes.data;

  const userRes = await getWCAUserInfo(wcaTokensRes.data.access_token);
  if (!userRes.success) {
    return redirectAndClearState("/login?error");
  }
  const user = userRes.data;

  const tokens = await createSession(wcaTokens, user);
  const res = NextResponse.redirect(new URL("/min-side", url));
  res.cookies.delete("WCA_OAUTH_STATE");
  setAuthCookies(res, tokens);
  return res;
}
