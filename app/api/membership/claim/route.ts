import { getSessionToken } from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";
import { claimMembership } from "@/app/utils/vipps-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = getBaseUrl(req);
  try {
    const userId = (await getSessionToken()).payload.userId as number;
    if (userId === undefined) {
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
  } catch {
    return NextResponse.redirect(new URL("/", url));
  }
}
