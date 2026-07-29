import { getAddress, updateAddress } from "@/lib/address";
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
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Input har ikke gyldig format." }, { status: 400 });
  }
  const inputAddress = body.address;
  if (!inputAddress) {
    return NextResponse.json({ error: "Adresse ikke gitt som parameter." }, { status: 400 });
  }
  const addressValidation = await getAddress(inputAddress);
  if (!addressValidation.success) {
    switch (addressValidation.error) {
      case "api_failure":
        return NextResponse.json({ error: "Fikk ikke tak i eksternt API." }, { status: 500 });
      case "invalid_input":
        return NextResponse.json({ error: "Input mangler nødvendige parametre." }, { status: 400 });
      case "inconclusive":
        return NextResponse.json({ error: "Kunne ikke finne adressen" }, { status: 404 });
    }
  }
  const success = await updateAddress(userId, addressValidation.address);
  if (!success) {
    return NextResponse.json({ error: "Noe gikk galt." }, { status: 500 })
  }
  return NextResponse.json({ message: "Adresse oppdatert." });
}
