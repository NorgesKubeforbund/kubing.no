import { getAuth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { createVippsPaymentAndGetRedirectUrl } from "@/lib/vipps";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentMethod: string }> }) {
  const { paymentMethod } = await params;
  if (paymentMethod !== "WALLET" && paymentMethod !== "CARD") {
    return NextResponse.json({ error: "Ugyldig betalingsmåte." }, { status: 400 });
  }
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const orderCreation = await createVippsPaymentAndGetRedirectUrl(userId, paymentMethod, getBaseUrl());
  if (!orderCreation.success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  if (orderCreation.status === "created_order") {
    return NextResponse.json({ hasPaid: false, url: orderCreation.redirectUrl });
  }
  return NextResponse.json({ hasPaid: true });
}
