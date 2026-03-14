import { updateAddress } from "@/app/db";
import { getAddress } from "@/app/utils/address-utils";
import { getSessionToken } from "@/app/utils/auth-utils";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = (await getSessionToken()).payload.userId as number;
    if (userId === undefined) {
      return NextResponse.json({ error: "Ingen bruker er laget enda" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.address) {
      return NextResponse.json({ error: "Adresse ikke gitt som parameter." }, { status: 400 });
    }
    try {
      const address = await getAddress(body.address);
      try {
        await updateAddress(userId, address);
        return NextResponse.json({ message: "Adresse oppdatert" });
      } catch {
        return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ error: "Ikke gyldig addresse" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }
}
