import { getAuth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { claimMembership } from "@/lib/vipps";
import { NextRequest, NextResponse } from "next/server";

// TODO: When it is only possible to have a single active order, move logic to my page
export async function GET(req: NextRequest) {
  const url = getBaseUrl(req);
  const { userId } = await getAuth();
  if (userId === null) {
    return NextResponse.redirect(new URL("/", url));
  }
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.redirect(new URL("/min-side?error=Ingen ordre nummer", url));
    }
    await claimMembership(userId, orderId);
    return NextResponse.redirect(new URL("/min-side", url));
  } catch {
    return NextResponse.redirect(new URL("/min-side?error=Kunne ikke finne ordre, eller ordre ikke betalt", url));
  }
}
