import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken, getSessionToken } from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";

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
