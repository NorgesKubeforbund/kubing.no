import { handleOrphanedCharges } from "@/lib/vipps";
import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/security";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !authHeader || !safeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Ugyldig nøkkel." }, { status: 401 });
  }
  const success = await handleOrphanedCharges();
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  return NextResponse.json({ message: "Håndtert trekk med stoppet avtale." });
}
