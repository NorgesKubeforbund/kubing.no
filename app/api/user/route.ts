import {
  createUser,
  getRefreshToken,
  getSessionToken,
  SESSION_TOKEN_NAME,
  setAuthCookies,
  updateTokens
} from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const decoded = await getSessionToken();
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      const res = NextResponse.json({}, { status: 401 });
      res.cookies.delete(SESSION_TOKEN_NAME);
      return res;
    }
    try {
      const sessionId = decoded.payload.sub;
      await createUser(sessionId!, getBaseUrl(req));
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
  } catch {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
}
