import { getSessionToken } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { createVippsPaymentAndGetRedirectUrl } from "@/lib/vipps";
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
    } catch (err) {
      console.log(err);
      return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }
}
