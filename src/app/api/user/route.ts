import { getAddress } from "@/lib/address";
import {
  createUser,
  getRefreshToken,
  getAuth,
  SESSION_TOKEN_NAME,
  setAuthCookies,
  updateTokens
} from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { isAuthenticated, sessionId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    const res = NextResponse.json({}, { status: 401 });
    res.cookies.delete(SESSION_TOKEN_NAME);
    return res;
  }
  try {
    const body = await req.json();
    const address = body.address ? await getAddress(body.address) : null;
    await createUser(sessionId!, getBaseUrl(req), address);
    const tokens = await updateTokens(refreshToken);
    if (!tokens) {
      throw new Error("Could not generate tokens");
    }
    const res = NextResponse.json({});
    setAuthCookies(res, tokens);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Noe gikk galt..." }, { status: 500 });
  }
}
