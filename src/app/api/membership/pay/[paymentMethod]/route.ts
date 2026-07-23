import { getAuth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { isUserMember } from "@/lib/user";
import { createVippsPaymentAndGetRedirectUrl } from "@/lib/vipps";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentMethod: string }> }) {
  const { paymentMethod } = await params;
  if (paymentMethod !== "WALLET" && paymentMethod !== "CARD") {
    return NextResponse.json({ error: "Ugyldig betalingsmåte." }, { status: 401 });
  }
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const isMember = await isUserMember(userId);
  if (isMember) {
    return NextResponse.json({ error: "Allerede medlem i år." }, { status: 409 });
  }
  try {
    const url = await createVippsPaymentAndGetRedirectUrl(userId, paymentMethod, getBaseUrl(req));
    return NextResponse.json({ url: url });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
}
