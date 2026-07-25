import { getRefreshToken, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME, setAuthCookies, updateTokens } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "Mangler 'refresh token'." }, { status: 400 });
  }
  const tokenCreation = await updateTokens(refreshToken);
  if (!tokenCreation.success) {
    switch (tokenCreation.error) {
      case "invalid":
        return NextResponse.json({ error: "Kunne ikke finne økten." }, { status: 404 });
      case "too_early":
        return NextResponse.json({ error: "Du må vente i 60 sekunder før du fornyer økten." }, { status: 429 });
      case "expired":
        return clearSessionRes(401, "Økten har utløpt.");
    }
  }
  // TODO: Validate that WCA session is still valid
  const res = NextResponse.json({ message: "Økt fornyet." });
  setAuthCookies(res, tokenCreation.tokens);
  return res;
}

function clearSessionRes(statusCode: number, errorMessage: string) {
  const res = NextResponse.json({ error: errorMessage }, { status: statusCode });
  res.cookies.delete(REFRESH_TOKEN_NAME);
  res.cookies.delete(SESSION_TOKEN_NAME);
  return res;
}
