import { getAuth, updateWCAInfo } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { isAuthenticated, userId, sessionId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  const success = await updateWCAInfo(userId, sessionId, getBaseUrl(req));
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
  }
  return NextResponse.json({ message: "Informasjon oppdatert." });
}
