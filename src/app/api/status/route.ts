import { getSessionToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await getSessionToken()
    return NextResponse.json({ isLoggedIn: true })
  } catch {
    return NextResponse.json({ isLoggedIn: false })
  }
}
