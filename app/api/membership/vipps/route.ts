import { getSessionToken } from "@/app/utils/auth-utils";
import { getBaseUrl } from "@/app/utils/url-utils";
import { createVippsPaymentAndGetRedirectUrl } from "@/app/utils/vipps-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = (await getSessionToken()).payload.userId as number;
    if (userId === undefined) {
      return NextResponse.json({ error: "Ingen bruker er laget enda" }, { status: 403 });
    }
    try {
      const url = await createVippsPaymentAndGetRedirectUrl(userId, "WALLET", getBaseUrl(req));
      return NextResponse.json({ url: url });
    } catch {
      return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }
}
