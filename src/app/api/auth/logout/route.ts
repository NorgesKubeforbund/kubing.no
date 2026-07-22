import { deleteSession } from "@/db";
import { getSessionToken, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", getBaseUrl(req)));
  res.cookies.delete(SESSION_TOKEN_NAME);
  res.cookies.delete(REFRESH_TOKEN_NAME);
  try {
    const decoded = await getSessionToken();
    const sessionId = decoded.payload.sub;
    if (!sessionId) {
      return res;
    }
    await deleteSession(sessionId);
    return res;
  } catch {
    return res;
  }
}
