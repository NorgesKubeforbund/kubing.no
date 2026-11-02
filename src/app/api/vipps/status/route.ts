import { getAuth } from "@/lib/auth";
import { getAgreementStatus, getOrderStatus } from "@/lib/vipps";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  
  const type = req.nextUrl.searchParams.get("type")
  if (type !== "avtale" && type !== "betaling") {
    return NextResponse.json({ error: "Ugyldige eller manglende parameter." }, { status: 400 })
  }

  const status = type === "avtale" ? await getAgreementStatus(userId) : await getOrderStatus(userId);

  return NextResponse.json({ status })
}
