import { getSessionToken, updateWCAInfo } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    const sessionId = sessionToken.payload.sub;
    const userId = sessionToken.payload.userId as number;
    if (sessionId === undefined || userId === undefined) {
      return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
    }
    try {
      await updateWCAInfo(userId, sessionId, getBaseUrl(req));
      return NextResponse.json({ message: "Informasjon oppdatert." });
    } catch {
      return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
}
