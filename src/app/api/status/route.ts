import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAuthenticated } = await getAuth();
  return NextResponse.json({ isLoggedIn: isAuthenticated });
}
