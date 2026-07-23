import { NextRequest, NextResponse } from "next/server";
import { getAuth, getRefreshToken } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";

export async function proxy(req: NextRequest) {
  const { isAuthenticated } = await getAuth();
  if (!isAuthenticated && await getRefreshToken()) {
    const url = getBaseUrl(req);
    return NextResponse.redirect(
      new URL(
        `/api/auth/refresh?returnTo=${new URL(req.nextUrl.pathname, url)}`,
        url
      )
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
