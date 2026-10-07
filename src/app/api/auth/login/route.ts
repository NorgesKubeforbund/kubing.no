import { getBaseUrl } from "@/lib/config";
import { getWCALoginUrl } from "@/lib/wca-oauth";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || null;
  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("WCA_OAUTH_STATE", state, {
    path: "/",
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
  if (redirect) {
    cookieStore.set("REDIRECT_AFTER_LOGIN", redirect, {
      path: "/",
      maxAge: 600,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }
  return NextResponse.json({ wcaLoginUrl: getWCALoginUrl(getBaseUrl(), state) });
}
