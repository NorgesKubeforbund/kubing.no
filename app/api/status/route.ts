import { getSessionToken } from "@/app/utils/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await getSessionToken()
    return NextResponse.json({ isLoggedIn: true })
  } catch {
    return NextResponse.json({ isLoggedIn: false })
  }
}
