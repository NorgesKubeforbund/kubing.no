import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken, getSessionToken } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";

export async function proxy(req: NextRequest) {
  try {
    await getSessionToken();
  } catch {
    try {
      const url = getBaseUrl(req);
      if (await getRefreshToken()) {
        return NextResponse.redirect(
          new URL(
            `/api/auth/refresh?returnTo=${new URL(req.nextUrl.pathname, url)}`,
            url
          )
        );
      }
    } catch {
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
