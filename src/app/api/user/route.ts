import { getAddress } from "@/lib/address";
import {
  createUser,
  getAuth,
  SESSION_TOKEN_NAME,
  setAuthCookies,
  updateTokens
} from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { isAuthenticated, sessionId, refreshToken } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
  if (!refreshToken) {
    const res = NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
    res.cookies.delete(SESSION_TOKEN_NAME);
    return res;
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Input har ikke gyldig format." }, { status: 400 });
  }
  const addressValidation = body.address ? await getAddress(body.address) : null;
  if (addressValidation && !addressValidation.success) {
    switch (addressValidation.error) {
      case "api_failure":
        return NextResponse.json({ error: "Fikk ikke tak i eksternt API." }, { status: 500 });
      case "invalid_input":
        return NextResponse.json({ error: "Input mangler nødvendige parametre." }, { status: 400 });
      case "inconclusive":
        return NextResponse.json({ error: "Kunne ikke finne adressen" }, { status: 404 });
    }
  }
  const address = addressValidation?.address ?? null;
  const success = await createUser(sessionId!, getBaseUrl(req), address);
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt, fikk ikke laget bruker." }, { status: 500 });
  }
  const tokenCreation = await updateTokens(refreshToken, true, getBaseUrl(req));
  if (!tokenCreation.success) {
    return NextResponse.json({ error: "Noe gikk galt, fikk ikke laget bruker." }, { status: 500 });
  }
  const tokens = tokenCreation.tokens;
  const res = NextResponse.json({ message: "Bruker laget!" });
  setAuthCookies(res, tokens);
  return res;
}
