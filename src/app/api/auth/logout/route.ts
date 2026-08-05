import { deleteSession, getAuth, REFRESH_TOKEN_NAME, SESSION_TOKEN_NAME } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/", getBaseUrl()));
  res.cookies.delete(SESSION_TOKEN_NAME);
  res.cookies.delete(REFRESH_TOKEN_NAME);
  const { sessionId } = await getAuth();
  if (!sessionId) {
    return res;
  }
  await deleteSession(sessionId);
  return res;
}
