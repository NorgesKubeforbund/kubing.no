import { getBaseUrl } from "@/lib/utils";
import { getWCALoginUrl } from "@/lib/wca-oauth";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("WCA_OAUTH_STATE", state, {
    path: "/",
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
  return NextResponse.json({ wcaLoginUrl: getWCALoginUrl(getBaseUrl(), state) });
}
