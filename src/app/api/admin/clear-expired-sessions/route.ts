import { deleteExpiredSessions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Ugyldig nøkkel." }, { status: 401 });
  }
  await deleteExpiredSessions();
  return NextResponse.json({ message: "Gamle økter slettet." });
}
