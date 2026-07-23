import { updateAddress } from "@/db";
import { getAddress } from "@/lib/address";
import { getAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { isAuthenticated, userId } = await getAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Ikke autentisert." }, { status: 401 });
  }
  if (userId === null) {
    return NextResponse.json({ error: "Ingen bruker er laget enda." }, { status: 403 });
  }
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Adresse ikke gitt som parameter." }, { status: 400 });
    }
    try {
      const validAddress = await getAddress(address);
      try {
        await updateAddress(userId, validAddress);
        return NextResponse.json({ message: "Adresse oppdatert." });
      } catch {
        return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ error: "Ikke gyldig addresse." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Input har ikke gyldig format." }, { status: 400 });
  }
}
