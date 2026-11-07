import { getAuth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/config";
import { createVippsAgreementAndGetRedirectUrl, stopAgreement } from "@/lib/vipps";
import { NextResponse } from "next/server";

export async function POST() {
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const orderCreation = await createVippsAgreementAndGetRedirectUrl(userId, getBaseUrl());
  if (!orderCreation.success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  if (orderCreation.status === "created_agreement") {
    return NextResponse.json({ url: orderCreation.redirectUrl });
  }
  return NextResponse.json({});
}

export async function DELETE() {
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const success = await stopAgreement(userId);
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  return NextResponse.json({});
}
